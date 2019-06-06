import { RPCServer, RPCClientHandler } from 'bidirectional-rpc'
import { readFileSync } from 'fs'

const cert = readFileSync('./server-cert.pem').toString()
const key = readFileSync('./server-key.pem').toString()

class ClientHandler extends RPCClientHandler {
    onMessage() {}
    onRequestObservable() {
        return undefined
    }
    onClose(had_error: boolean) {
        console.log(`closed with${had_error ? '' : 'out'} error`)
    }

    async onQuestion(q: any) {
        if (q.type === 'delay') {
            await sleep(q.t as number)
            return {
                id: 'e367a5c8-1f18-4724-9c76-820ef6d9c0e5',
                ad: [
                    '4933228999',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                    '4933228976',
                ],
            }
        }
        throw new Error('Unkown question')
    }
}

const server = new RPCServer(key, cert)
server.registerDefaultHandler(() => new ClientHandler())
server.listen(3000, '0.0.0.0')

process.on('SIGTERM', () => {
    console.log('Shutting down')
    server.close()
})

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
