import {
    Body,
    Controller,
    Get,
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

export interface DtoMessage {
    text: string;
  }

@ApiTags('Сообщения')
@Controller('messages')
export class MessagesController {
    constructor(private messageService: MessagesService) {}

    @WebSocketServer() wss: Server;

    @WebSocketServer()
    set server(server: Server) {
        this.wss = server;
    }

    afterInit(server: Server) {
        this.wss = server;
    }

    @Post('test')
    createMessage(@Body() dto: DtoMessage) 
    {
        //this.wss.emit('msgToClient', dto.text);
        console.log('POST REQUEST TO FIRST SERVER TEST PASSED')
    }

    @Post('test2')
    async makePostRequest(@Body() body: {text: string}) 
    {
        console.log('POST REQUEST TO SECOND SERVER SENT(message to all)')
        await axios.post('http://localhost:3000/messages/messagetoall', body)
    }

    @Post('texttoroom')
    async createMessageToRoom(@Body() body: {room: string, text: string})
    {
        console.log('POST REQUEST TO SECOND SERVER SENT(message to room)')
        await axios.post('http://localhost:3000/messages/messagetoroom', body)
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
