# koa-route-mm

 koa-route-mm is a fork of koa-route, simple route middleware for koa.
 koa-route-mm allows to stack multiple middleware handlers to one route
 so you can, for example, wrap some route handlers into database transaction,
 which can be roll-backed on exception and commited on success.

 
## Example

  Wrap busyness-method into transaction and handle exceptions.
  

```js
var _ = require('koa-route');
var koa = require('koa');
var app = koa();

var db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

var pets = {
  list: function *(){
    var names = Object.keys(db);
    this.body = 'pets: ' + names.join(', ');
  },

  show: function *(name){
    var pet = db[name];
    if (!pet) return this.throw('cannot find that pet', 404);
    this.body = pet.name + ' is a ' + pet.species;
  }
};


inject_transaction = function*(next) {
    try {
        yield _begin_transaction();
        yield next;
        yield _commit_transaction();
    } catch (exc) {
        yield _rollback_transaction()
        throw exc
    }
}

app.use(_.get('/pets', inject_transaction, pets.list));
app.use(_.get('/pets/:name', pets.show));

app.listen(3000);
console.log('listening on port 3000');
```

## License

  MIT
