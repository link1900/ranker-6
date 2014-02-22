## Agra Ranking Server

Web server used to rank greyhounds.

## Usage

Clone this repository

    $ npm install
    $ npm start

## Todo

### Greyhound
-(DONE) interactive validation of name
-(DONE) have a view form for a greyhound
-(DONE) clicking table loads greyhound details into view form
-(DONE) have an edit mode
-(DONE) delete an existing greyhound
-(DONE) edit an existing greyhound
-(DONE) sire & dam fields (nav, edit, view)
- limit all server queries to 100 records (try to make it for all mongo queries in mongoose)
- backend pass through for limit and size
- table pagination
- search greyhound table
- correctly display sire and dam on greyhound list
- list offspring on view page
- have the look up of the name to say if it is new or not (off focus for the parent fields)
- greyhound data auto importer (progress bars, streaming backend) http://ngmodules.org/modules/angular-file-upload
- setup prod key
- setup login http://ngmodules.org/modules/http-auth-interceptor
- setup action security around editing greyhounds and creating greyhounds

### Deployment
- setup heroku app
- deploy to heroku
- test that it loads

### Races
- list races
- list a race calendar
- update when greyhound is deleted
- update greyhound when race is deleted

### Rankings
- design rules and ranking storage
- list ranking
- update when greyhound is deleted
- update when race is deleted

## Round 2
- Add prompts for delete actions
- Add a find parents button
- Add a loading bar https://github.com/chieffancypants/angular-loading-bar
- inline create form on greyhound
- inline edit form on greyhound
