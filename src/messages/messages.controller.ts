import {
    Body,
    Controller,
    Get,
    OnModuleInit,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RequestUser } from '../auth/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import axios from 'axios';
import { Observable } from 'rxjs';
import {
    GrpcMethod,
    ClientGrpc,
    Client,
    Transport,
} from '@nestjs/microservices';
import { grpcClientOptions } from 'src/grpc.options';

export interface DtoMessage 
{
    text: string;
}

interface ImessageServiceGrpc
{
    createMessageToRoomGrpc(data: {room: string, text: string}): Observable<any>;
}

@ApiTags('Сообщения')
@Controller('messages')
export class MessagesController implements OnModuleInit {
    constructor(private messageService: MessagesService) {}

    //под страхом выстрела пушки не трогать.
    @Client(grpcClientOptions) private readonly client: ClientGrpc;
    private grpcService: ImessageServiceGrpc
    onModuleInit()
    {
        this.grpcService = this.client.getService<ImessageServiceGrpc>('messageServiceGrpc');
    }

    @WebSocketServer() wss: Server;
    @WebSocketServer()
    set server(server: Server) 
    {
        this.wss = server;
    }
    afterInit(server: Server) 
    {
        this.wss = server;
    }
    //можно менять
    @Post('texttoroomgrpc')
    async handleCreateMessageToRoomGrpc(@Body() body: {room: string, text: string})
    {
        console.log('GRPC REQUEST TO SECOND SERVER SENT')
        return this.grpcService.createMessageToRoomGrpc(body);
    }

    @ApiOperation({ summary: 'отправка сообщения' })
    @ApiResponse({ status: 200 })
    @Post(':id')
    @UseGuards(JwtAuthGuard)
    findChat(
        @Param('id') id: number,
        @Req() request: RequestUser,
        @Body() body: { text: string }
    ) {
        const { id: userId } = request.user;
        return this.messageService.createMessage(userId, +id, body.text);
    }
}
