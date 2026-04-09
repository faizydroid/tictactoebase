import '../styles/globals.css'
import Head from 'next/head'
import { Web3Provider } from '../context/Web3Context'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="base:app_id" content="69d67de83966b044539edc43" />
      </Head>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </>
  )
}

export default MyApp