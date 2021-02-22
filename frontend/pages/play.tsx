import Layout from "../components/layout";
import Head from "next/head";
import game from '../styles/game.module.scss';

const { screensLeft, screensRight, screen } = game

export default function Game (context) {
  return (
    <Layout>
      <Head>
        <title>{'Outbreak'}</title>
      </Head>

      <div id={game.base}>
        <div id={screensLeft}>
          <div className={screen}>
            1st squad's character
          </div>
          <div className={screen}>
            2nd squad's character
          </div>
          <div className={screen}>
            3rd squad's character
          </div>
          <div className={screen}>
            4th squad's character
          </div>
        </div>
        <div id={screensRight}>
          <div className={screen}>
            1st squad's character
          </div>
          <div className={screen}>
            2nd squad's character
          </div>
          <div className={screen}>
            3rd squad's character
          </div>
          <div className={screen}>
            4th squad's character
          </div>
        </div>
      </div>s
    </Layout>
  )
}