let Connection = require('./Connection');
let Jogador = require('./Jogador');
const LobbyBase = require('./Lobbies/LobbyBase');
const GameLobby = require('./Lobbies/GameLobby');
const GameLobbySetting = require('./Lobbies/GameLobbySetting');

module.exports = class Servidor {
    constructor(cartasPorta, cartasTesouro){
        this.connection = [];
        this.lobbys = [];
        this.cartasPorta = cartasPorta;
        this.cartasTesouro = cartasTesouro;

        this.lobbys[0] = new LobbyBase(0);
    }
    
    //intervalos de 100 milisegundos de update
    onUpdate() {
        let server = this;

        for(let id in server.lobbys) {
            server.lobbys[id].onUpdate();
            if(server.lobbys[id].id !== 0 && server.lobbys[id].connections.length == 0) {
                server.lobbys.splice(server.lobbys.indexOf(server.lobbys[id]), 1)
                console.log("Deletou o lobby " + id);
                
            }
        }
    }
    
    //lida com novas conexões
    onConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Jogador();
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;
        
        console.log("Novo jogador no server: " + player.id);
        server.connection[player.id] = connection;
        
        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;

        delete server.connection[id];
        console.log('Player ' + connection.player.displayerPlayerInformation() + ' desconectou');

        //connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', connection.player);

        server.lobbys[connection.player.lobby].onLeaveLobby(connection);
    }

    onAttemptToJoinGame(connection = Connection) {
        let server = this;
        let lobbyFound = false;

        let gamelobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby
        });
        
        gamelobbies.forEach(lobby => {
            if(!lobbyFound) {
                console.log("achou um lobby");
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        if(!lobbyFound) {
            console.log("Criando um novo lobby");
            let copiedCartasPorta = server.cartasPorta.slice();
            let copiedCartasTesouro = server.cartasTesouro.slice();
            let gamelobby = new GameLobby(gamelobbies.length + 1, new GameLobbySetting('Padrao', 2), copiedCartasPorta, copiedCartasTesouro);
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }

    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID);
        connection.lobby = lobbys[lobbyID];

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }
}