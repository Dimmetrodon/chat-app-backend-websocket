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
    createMessage(@Body() body: {text: string}) 
    {
        this.wss.emit('msgToClient', body.text);
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
