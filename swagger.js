import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My API",
    description: "Website to buy food instantly",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/auth.route.js", "./routes/product.route.js"];

swaggerAutogen()(outputFile, routes, doc);
