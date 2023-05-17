import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientOptions = 
{
  transport: Transport.GRPC,
  options: 
  {
    url: 'localhost:50051', //grpc port
    package: 'app',
    protoPath: join(__dirname, '../src/app.proto'),
  },
};
