require("dotenv").config();
const chalk = require("chalk");

const Client = require("./client");
const Server = require("./server");

const defaultData = {
  users: [],
  providers: []
};

const run = async () => {
  try {
    const client = new Client();
    const server = new Server({
      init: () => {
        console.log(chalk.green("Server is running"));
      },
      port: process.env.PORT || 3000,
      subscriber: async data => {
        try {
          await client.save("db.json", data);
        } catch (error) {
          console.log(`subscriber: ${error}`);
        }
      }
    });

    console.log(chalk.blue("Loading data"));

    let data = await client.load("db.json");
    
    if (!data) {
      data = defaultData;
    }

    return server.start(data);
  } catch (error) {
    console.log(error.message, error.stack);
  }
};

run();