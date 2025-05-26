import { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import idl from './idl.json';

const PROGRAM_ID = new PublicKey("ZkHKk2YoXx7dzeNjVVD6aSBqB2YyCh4FSTwEnLtADZ4");
const NETWORK = clusterApiUrl("devnet");

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [provider, setProvider] = useState(null);
  const [jackpot, setJackpot] = useState(null);

  useEffect(() => {
    if (walletAddress && window.solana) {
      const connection = new Connection(NETWORK, 'confirmed');
      const provider = new AnchorProvider(connection, window.solana, { commitment: 'confirmed' });
      const program = new Program(idl, PROGRAM_ID, provider);
      setProvider(provider);
      setProgram(program);
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    const resp = await window.solana.connect();
    setWalletAddress(resp.publicKey.toString());
  };

  const enterLottery = async () => {
    const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from("vault")], PROGRAM_ID);
    const [entryPda] = await PublicKey.findProgramAddress([Buffer.from("entry")], PROGRAM_ID);

    await program.methods.enterLottery().accounts({
      user: provider.wallet.publicKey,
      vault: vaultPda,
      entry: entryPda
    }).rpc();

    alert("🎉 Entered the lottery!");
  };

  const getJackpot = async () => {
    const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from("vault")], PROGRAM_ID);
    const vault = await program.account.vault.fetch(vaultPda);
    setJackpot(vault.total);
  };

  return (
    <div>
      <h1>🎲 Solana Lottery</h1>
      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {walletAddress}</p>
      )}
      <button onClick={enterLottery}>Enter Lottery</button>
      <button onClick={getJackpot}>Check Jackpot</button>
      {jackpot !== null && <p>🎁 Total Entries: {jackpot} (~{jackpot} SOL)</p>}
    </div>
  );
}

export default App;
