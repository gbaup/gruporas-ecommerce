import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { urlencoded, json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: `logs/error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
          filename: `logs/combined.log`,
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.Console({
          format: format.combine(
            format.colorize({
              colors: {
                info: 'green',
                error: 'red',
                warn: 'yellow',
                debug: 'blue',
              },
              message: true,
            }),
            format.cli(),
            format.splat(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.prettyPrint({ colorize: true, depth: 5 }),
            format.printf((info) => {
              return `[${info.timestamp}] - ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
  });

  app.use(json({ limit: '50mb' }));

  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ecommerce Grupo Ras')
    .setDescription('ecommerce endpoints')
    .addBearerAuth(
      {
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
