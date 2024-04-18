const swcDefaultConfig =
  require("@nestjs/cli/lib/compiler/defaults/swc-defaults").swcDefaultsFactory()
    .swcOptions;
// const { IgnorePlugin } = require('webpack');
module.exports = {
  externals: ["bcrypt"],
  node: {
    // required for __dirname to properly resolve
    // Also required for `bull` to work, see https://github.com/OptimalBits/bull/issues/811
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: (_) =>
          /node_modules/.test(_) && !/node_modules\/(@webloom)/.test(_),
        use: {
          loader: "swc-loader",
          options: swcDefaultConfig,
        },
      },
    ],
  },
  //  plugins: [
  //     new IgnorePlugin({
  //       checkResource(resource) {
  //         const lazyImports = [
  //           '@fastify/static',
  //           '@fastify/view',
  //           '@nestjs/microservices',
  //           '@nestjs/microservices/microservices-module',
  //           '@nestjs/platform-express',
  //           '@nestjs/websockets/socket-module',
  //           'amqp-connection-manager',
  //           'amqplib',
  //           'cache-manager',
  //           'cache-manager/package.json',
  //           'class-transformer/storage',
  //           'hbs',
  //           'ioredis',
  //           'kafkajs',
  //           'mqtt',
  //           'nats',
  //         ];
  //         if (!lazyImports.includes(resource)) {
  //           return false;
  //         }
  //         try {
  //           require.resolve(resource, { paths: [process.cwd()] });
  //         } catch (err) {
  //           return true;
  //         }
  //         return false;
  //       },
  //     }),
  //   ],
};
