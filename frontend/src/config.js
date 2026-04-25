import { createConfig, http } from 'wagmi'
import { monadTestnet } from 'viem/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz')
  }
})

export const VALIDA_CORE_ADDRESS = '0x3a07683D9B0DFe56621EFc1977BF9B3509BaB5e8'
export const VALIDA_TOKEN_ADDRESS = '0x49495ACB85B9125C0d9c666Fd3fd6bFC6450e49A'

export const VALIDA_CORE_ABI = [
  { type: 'function', name: 'registerHost', inputs: [{ name: '_name', type: 'string' }, { name: '_description', type: 'string' }, { name: '_location', type: 'string' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'requestStay', inputs: [{ name: '_host', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'payable' },
  { type: 'function', name: 'acceptStay', inputs: [{ name: '_stayId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'checkIn', inputs: [{ name: '_stayId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'submitReview', inputs: [{ name: '_stayId', type: 'uint256' }, { name: '_score', type: 'uint8' }, { name: '_comment', type: 'string' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'getHostCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getHostAddress', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'hosts', inputs: [{ name: '', type: 'address' }], outputs: [{ name: 'name', type: 'string' }, { name: 'description', type: 'string' }, { name: 'location', type: 'string' }, { name: 'isAvailable', type: 'bool' }, { name: 'isRegistered', type: 'bool' }, { name: 'totalStays', type: 'uint256' }, { name: 'totalScore', type: 'uint256' }, { name: 'reviewCount', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getHostReputation', inputs: [{ name: '_host', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'stayCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'stays', inputs: [{ name: '', type: 'uint256' }], outputs: [{ name: 'traveler', type: 'address' }, { name: 'host', type: 'address' }, { name: 'createdAt', type: 'uint256' }, { name: 'status', type: 'uint8' }, { name: 'hostScore', type: 'uint8' }, { name: 'travelerScore', type: 'uint8' }, { name: 'hostComment', type: 'string' }, { name: 'travelerComment', type: 'string' }, { name: 'hostReviewed', type: 'bool' }, { name: 'travelerReviewed', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'STAY_FEE', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }
]

export const VALIDA_TOKEN_ABI = [
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' }
]
