let Connection = require('../Connection');

module.exports = class LobbyBase {
    constructor(id) {
        this.id = id;
        this.connections = [];
    }
    
    onUpdate() {
        
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayerPlayerInformation() + ' entrou no lobby: ' + lobby.id);
        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayerPlayerInformation() + ' saiu do lobby: ' + lobby.id);
        connection.lobby = undefined;
        
        let index = lobby.connections.indexOf(connection);
        if(index > -1) {
            lobby.connections.splice(index, 1);
        }
    }

    getPlayer(index) {
        return this.connections[index].player.id;
    }

}