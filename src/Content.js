import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import idl from './port_contract.idl.json';
import { Buffer } from 'buffer';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './solana_customs.idl';
import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { useState } from 'react';

const CANISTER_ID = 'v76zi-jyaaa-aaaar-qaotq-cai';
const IC_HOST = 'https://icp0.io';
const USER_PRINCIPAL_ID =
  'onpkv-r64im-go7um-v7jnc-i33lg-ubem4-sxbyk-megsv-ww7fz-yzee7-zae';

function principalToSubaccount(p) {
  let principal = Principal.fromText(p);
  const bytes = principal.toUint8Array();
  const subaccount = new Uint8Array(32).fill(0);
  let i = 0;
  while (i < bytes.length && i < 32) {
    subaccount[31 - i] = bytes[bytes.length - 1 - i];
    i++;
  }
  return subaccount;
}

function Content() {
  const wallet = useAnchorWallet();
  const [txid, setTxid] = useState('');
  const [status, setStatus] = useState('');

  const handleDemo = async() => {
    try {
      await demo();
    } catch (e) {
      setStatus(e.message);
    }
  };

  const demo = async () => {
    setStatus('Building transaction...');

    const connection = new Connection(
      process.env.REACT_APP_CLUSTER_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, provider);

    const portBuffer = Buffer.from([112, 111, 114, 116]);
    const [portPda] = await PublicKey.findProgramAddress(
      [portBuffer],
      program.programId
    );

    const vaultBuffer = Buffer.from([118, 97, 117, 108, 116]);
    const [vaultPda] = await PublicKey.findProgramAddress(
      [vaultBuffer, portPda.toBuffer()],
      program.programId
    );

    const account = {
      owner: Principal.fromText('u32fb-xyaaa-aaaaj-az4eq-cai'),
      subaccount: principalToSubaccount(USER_PRINCIPAL_ID),
    };

    const targetChain = 'eICP';
    const recipient = encodeIcrcAccount(account);
    const amount = 8000000;

    const transaction = new Transaction();
    const transferInstruction = await program.methods
      .transport(targetChain, recipient, new BN(amount))
      .accounts({
        port: portPda,
        vault: vaultPda,
        user: new PublicKey(wallet.publicKey),
      })
      .instruction();

    transaction.add(transferInstruction);

    let blockhash = (await connection.getLatestBlockhash('finalized'))
      .blockhash;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    setStatus('Waiting for signature...');
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    console.log(signature);

    setStatus('Waiting for transaction confirmation...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await connection.confirmTransaction(signature, 'finalized');
    console.log('Transaction confirmed');

    const agent = new HttpAgent({ host: IC_HOST });
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });

    setStatus('Generating ticket...');
    const tokenId = 'Solana-native-SOL';
    const result = await actor.generate_ticket({
      signature,
      token_id: tokenId,
      target_chain_id: targetChain,
      amount,
      receiver: recipient,
    });

    if (result.Err) {
      console.error(result.Err);
      return;
    }

    setTxid(signature);
    setStatus('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Omnify Demo</h1>

        <WalletMultiButton className="wallet-adapter-button" />

        <button type="submit" onClick={handleDemo}>
          Run Demo
        </button>

        {status && <p>{status}</p>}

        {txid && (
          <p>
            <a
              href={`https://explorer.omnity.network/ticket/${txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="App-link"
            >
              View on Omnify
            </a>
          </p>
        )}
      </header>
    </div>
  );
}

export default Content;
