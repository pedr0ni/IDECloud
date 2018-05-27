import socketIO = require('socket.io');

class Server {

    private _server:socketIO.Server;
    private _clients: Array<socketIO.Client>;
    private _namespaces: Array<socketIO.Namespace> = [];

    constructor() {
        this._server = socketIO();
        this._server.on('connection', (client) => {
            console.log("[INFO] Client connected on IDECloud.");
            client.on('createNamespace', (data: any) => {
                if (this.getByName(data.name) != null) {
                    console.log("[ERROR] Namespace " + data.name + " already exists.");
                    return;
                }
                this.createNamespace(data.name);
            });
        });
        this._server.listen(4040);
        console.log("[INFO] Socket server initialized...");
    }

    private createNamespace(name: string) {
        let nsp = this._server.of('/'+name);
        this._namespaces.push(nsp);
        nsp.on('connection', (client) => {
            console.log("[INFO] Client connected on namespace " + name + ".");

            client.on('clientCodeUpdate', (data: any) => {
                console.log("[INFO] Received code update and sent to " + data.namespace);
                data.from = client.id;
                nsp.emit('serverCodeUpdate', data);
            });
        });
        console.log("[INFO] Namespace " + name + " created.");
    }

    private getNamespaces(): Array<socketIO.Namespace> {
        return this._namespaces;
    }

    private getByName(name: string): socketIO.Namespace {
        let res: socketIO.Namespace = null;
        this._namespaces.forEach((entry: socketIO.Namespace) => {
            if (entry.name == name) res = entry;
        });
        return res;
    }

}

console.log("[IDECLOUD] Initializing cloud socket server script...");
new Server();