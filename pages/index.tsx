import Head from "next/head"
import { useEffect, useState } from "react"
import {
    clusterApiUrl,
} from "@solana/web3.js"
import Wallet from "@project-serum/sol-wallet-adapter"

function toHex(buffer: Buffer) {
    return Array.prototype.map
      .call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2))
      .join('');
}

export default function Index() {
    const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined | null>(null)
    const [walletAddress, setWalletAddress] = useState<string>(null)
    const [walletRef, setWalletRef] = useState<Wallet | undefined | null>(null)
    const [messageSignature, setMessaggeSignature] = useState("")

    const network = clusterApiUrl('devnet')
    const providerUrl = 'https://www.sollet.io'

    async function signMessage(e) {
        e.preventDefault()
        const message = e.target.message.value
        setMessaggeSignature(null)

        try {
          if (!selectedWallet) {
            throw new Error('wallet not connected')
          }

          if(!message) {
            throw new Error('no message provided')
          }

          const data = new TextEncoder().encode(message)
          let { signature } = await selectedWallet.sign(data, 'utf8');
          setMessaggeSignature(toHex(signature))
        } catch (e) {
          console.warn(e)
          console.error(`Error: ${(e as Error).message}`)
        }
    }

    useEffect(() => {
        setWalletRef(new Wallet(providerUrl, network))
    }, [providerUrl, network])

    useEffect(() => {
        if (walletRef) {
            walletRef.on('connect', () => {
                setSelectedWallet(walletRef)
                setWalletAddress(walletRef.publicKey?.toString())
            })
            walletRef.on('disconnect', () => {
                setSelectedWallet(null)
                setWalletAddress(null)
            })
            void walletRef.connect()

            return () => {
                void walletRef.disconnect()
            }
        }
    }, [walletRef])

    return(
        <>
            <Head>
                <title>Ninja Test Task</title>
                <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/forms@0.3.3/dist/forms.min.css"/>
            </Head>
            <main className="max-w-4xl mx-auto py-12 h-screen flex items-center justify-center">
                <form className="w-full space-y-2" onSubmit={signMessage}>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Wallet Address
                        </label>
                        <input 
                            type="text"
                            name="address"
                            id="address"
                            className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                            value={walletAddress ?? "Please connect your wallet"}
                            disabled />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <input 
                            type="text"
                            name="message"
                            id="message"
                            className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                            disabled={!walletAddress} />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Message Signature
                        </label>
                        <input 
                            type="text"
                            name="message_signature"
                            id="message-signature"
                            className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                            value={messageSignature}
                            disabled />
                    </div>
                    <div>
                        <button 
                            className="bg-indigo-600 text-white font-medium text-white rounded-md px-8 py-2" 
                            type="submit">
                                Sign message
                        </button>
                    </div>
                </form>
            </main>
        </>
    )
}