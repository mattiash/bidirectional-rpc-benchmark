import 'source-map-support/register'
import * as rpc from 'bidirectional-rpc'

const SERVER_DELAY = 150
const NUM_REQUESTS = 1500
const THREADS = 10
const CLIENTS = 20

let requests = NUM_REQUESTS

let ip = process.argv[2]
let port = 3000

class ClientHandler extends rpc.RPCClientHandler {
    onConnect() {
        console.log('Connected')
        addClient(this.client)
    }

    onMessage(data: any) {
        console.log('Client received', data)
    }

    onClose(had_error: boolean) {
        console.log(`closed with${had_error ? '' : 'out'} error`)
    }

    onQuestion() {
        return Promise.reject()
    }

    onRequestObservable() {
        return undefined
    }
}

function connect(ip: string, port: number, token: string) {
    console.log('Token', token)

    let client = new rpc.RPCClient(new ClientHandler(), port, ip, token)
}

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

const clients = new Array<rpc.RPCClient>()
function addClient(client: rpc.RPCClient) {
    clients.push(client)
}

async function thread(client: rpc.RPCClient) {
    while (requests > 0) {
        requests--
        await client.askQuestion({ type: 'delay', t: SERVER_DELAY })
    }
}
async function run() {
    for (let c = 0; c < CLIENTS; c++) {
        connect(
            ip,
            port,
            'secret',
        )
    }

    await sleep(1000)

    const start = Date.now()
    let promises = new Array<Promise<void>>()
    for (let client of clients) {
        for (let t = 0; t < THREADS; t++) {
            promises.push(thread(client))
        }
    }

    await Promise.all(promises)
    console.log(Date.now() - start)
    for (let client of clients) {
        client.close()
    }
}

run()
