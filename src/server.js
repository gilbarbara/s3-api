const jsonServer = require("json-server");
const ObjectID = require("bson-objectid");

module.exports = class Server {
  constructor({ init, port = 3000, subscriber }) {
    this.init = init;
    this.port = port;
    this.subscriber = subscriber;
  }

  start(data) {
    const server = jsonServer.create();
    const router = jsonServer.router(data);
    const middlewares = jsonServer.defaults({ bodyParser: true });

    this.db = router.db;
  
    server.use(middlewares);
    server.use((req, res, next) => {
      const now = Date.now();
  
      if (req.method === "POST") {
        req.body.id = ObjectID().toString();
        req.body._createdAt = now;
        req.body._updatedAt = now;
      }
  
      if (req.method === "PUT") {
        const [, path, id] = req.url.match(/^\/([^\/]+)\/([^\/]+)/);
        const item = router.db.get(path)
        .find({ id: id })
        .value();
  
        if (item && item._createdAt) {
          req.body._createdAt = item._createdAt; 
        }
      }
  
      if (['PUT', 'PATCH'].includes(req.method)) {
        req.body._updatedAt = now;
      }
      
      next();
    });
    router.render = (req, res) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && this.subscriber) {
        this.subscriber(router.db.getState());
      }
  
      res.jsonp(res.locals.data);
    };
    server.use(router);
  
    return server.listen(this.port, this.init);
  }

  get data () {
    return this.db.getState();
  }

  set data (data) {
    this.db.setState(data);
  }
};
