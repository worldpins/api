__Document started 29/09 22:46 by Jovi De Croock__

# Dynamic pins

When talking to someone about the project a question came up asking if the pins could be customised, 
in essence this implies that the user would be able to set up a pin-type for the future pins. 

This type would contain essential information for their use case, example amount of citizens.

## First thoughts

My first thought was to use the `JSONB` provided by PG to fill this need, this type allows us to 
specify arbitrary data in form of a JS Object. This provides us with the dynamic nature of this use case, 
while keeping an eye on usability.

A second part needed for this approach would be to ask the user to pre define the types, this way the application 
can ask the right information to write to the DB.

## To be continued

