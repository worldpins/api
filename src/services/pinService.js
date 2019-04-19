const uuid = require('uuid/v4');
const { ApolloError, AuthenticationError } = require('apollo-server-koa');

const dataController = require('../data');
const { makeLogger } = require('../utils/logger');
const { MAP_NOT_FOUND } = require('../constants/maps');

const logger = makeLogger('pinService');

function getMinMax(all, field) {
  const points = all
    .map(p => p.data[field].replace(',', '.'))
    // eslint-disable-next-line no-restricted-globals
    .filter(p => p !== null && p !== undefined && p !== '' && !isNaN(Number(p)));
  const sorted = points.sort((a, b) => a - b);
  return { min: sorted[0], max: sorted[sorted.length - 1] };
}

function getChoiches(all, field) {
  const choiches = new Set();
  all.forEach(({ data }) => {
    const point = data[field];
    if (point) {
      if (point.includes(',')) {
        const c = point.split(',');
        c.forEach((ch) => {
          const final = ch.trim().toLowerCase();
          if (final) choiches.add(final);
        });
      } else {
        choiches.add(point.trim().replace('-', ' ').toLowerCase());
      }
    }
  });
  return [...choiches];
}

function getRanges(all, field) {
  const ranges = new Set();
  all.forEach(({ data }) => {
    const point = data[field];
    if (point) ranges.add(point);
  });
  return [...ranges];
}

const EXCLUDED = ['Street', 'Zipcode'];
function filterUselessFilters(filters) {
  const validKeys = Object.keys(filters).filter((key) => {
    if (filters[key].choices && filters[key].choices.length < 2) return false;
    if (filters[key].ranges && filters[key].ranges.length < 2) return false;
    if (EXCLUDED.includes(key)) return false;
    return true;
  });
  const validFilters = validKeys.reduce((acc, key) => ({ ...acc, [key]: filters[key] }), {});
  validFilters['Age range'] = { type: 'numeric', min: 0, max: 100 };
  return validFilters;
}

function deriveFilters(fields, allPins) {
  const filters = {};
  fields.forEach((templateField) => {
    const pinWithData = allPins.find(({ data }) => data[templateField]);
    if (pinWithData) {
      const datapoint = pinWithData.data[templateField];
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(Number(datapoint.replace(',', '.')))) {
      // Numeric
        filters[templateField] = {
          type: 'numeric',
          ...getMinMax(allPins, templateField),
        };
      // eslint-disable-next-line no-restricted-globals
      } else if (datapoint.split('-').length === 2 && !isNaN(Number(datapoint.split('-')[0].replace(',', '.')))) {
        // Ranges
        filters[templateField] = {
          type: 'range',
          ranges: getRanges(allPins, templateField),
        };
      } else {
        // Checkboxes
        filters[templateField] = {
          type: 'choice',
          choices: getChoiches(allPins, templateField),
        };
      }
    }
  });
  return filterUselessFilters(filters);
}

class MapService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async getTemplatePinsForMap(mapId) {
    return this.dataController('template_pins')
      .select('id', 'name', 'comment', 'fields')
      .where('map_id', mapId);
  }

  async getFiltersForMap(mapId) {
    try {
      const pins = await this.dataController('pins')
        .select('pins.data', 'template_pins.fields')
        .join('template_pins', 'pins.template_pin_id', 'template_pins.id')
        .where('pins.map_id', mapId);

      return deriveFilters(pins[0].fields, pins);
    } catch (e) {
      logger.warn(e);
      throw e;
    }
  }

  async getPinsForMap(mapId) {
    try {
      const pins = await this.dataController('pins')
        .select('pins.id', 'pins.name', 'pins.coordinates', 'pins.comment', 'pins.data', 'template_pins.fields')
        .join('template_pins', 'pins.template_pin_id', 'template_pins.id')
        .where('pins.map_id', mapId);

      return pins.map(({
        coordinates, data, fields, ...rest
      }) => ({
        ...rest,
        data,
        orderedFields: fields.map(field => data[field] && field).filter(Boolean),
        location: {
          latitude: coordinates && coordinates.y,
          longitude: coordinates && coordinates.x,
        },
      }));
    } catch (e) {
      logger.warn(e);
      throw e;
    }
  }

  async createTemplatePin(mapId, { fields, name, comment }) {
    // Make and return pin.
    return this.dataController('template_pins')
      .insert({
        id: uuid(),
        fields: JSON.stringify(fields),
        name,
        comment,
        map_id: mapId,
      });
  }

  async getPin(id, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    const pin = await this.dataController('pin')
      .select('pins.id', 'pins.name', 'pins.comment', 'pins.coordinates', 'pins.data')
      .where('id', id)
      .first();

    if (!pin) {
      throw new ApolloError(`map with id "${id}" can't be found.`, MAP_NOT_FOUND);
    }

    return {
      ...pin,
      location: {
        latitude: pin.coordinates && pin.coordinates.y,
        longitude: pin.coordinates && pin.coordinates.x,
      },
    };
  }

  async updatePin(mapId, {
    id, coordinates, templatePinId, ...rest
  }) {
    // Prepare coordinates.
    let dbCoordinates;
    if (coordinates.latitude && coordinates.longitude) {
      dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
    }

    // Make and return pin.
    return this.dataController('pins')
      .update({
        ...rest,
        id: uuid(),
        coordinates: dbCoordinates,
        template_pin_id: templatePinId,
        map_id: mapId,
      }).where('id', id);
  }

  async createPin(mapId, { coordinates, templatePinId, ...rest }) {
    // Prepare coordinates.
    let dbCoordinates;
    if (coordinates.latitude && coordinates.longitude) {
      dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
    }

    // Make and return pin.
    return this.dataController('pins')
      .insert({
        ...rest,
        id: uuid(),
        coordinates: dbCoordinates,
        template_pin_id: templatePinId,
        map_id: mapId,
      });
  }
}

module.exports = new MapService();
