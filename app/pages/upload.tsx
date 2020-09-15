import { useState, useContext } from 'react';
import Head from 'next/head';

import { PuzzleInProgressT } from '../lib/types';
import { importFile } from '../lib/converter';
import { AuthContext, renderLoginButtonIfNeeded } from '../components/AuthContext';
import { Preview } from '../components/Preview';
import { Link } from '../components/Link';
import { MdMoneyOff } from 'react-icons/md';
import { FaShareSquare, FaChartBar, FaComment } from 'react-icons/fa';
import { IoMdPhonePortrait, IoMdResize } from 'react-icons/io';
import { RiPagesLine } from 'react-icons/ri';
import { FeatureList, FeatureListItem } from '../components/FeatureList';
import { BigQuote } from '../components/BigQuote';
import { Hero } from '../components/Hero';

export default function UploadPage() {
  const ctx = useContext(AuthContext);

  const [puzzle, setPuzzle] = useState<PuzzleInProgressT | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginButton = renderLoginButtonIfNeeded(ctx);

  function handleFile(f: FileList | null) {
    if (!f) {
      setError('No file selected');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (!fileReader.result) {
        setError('No file result');
      } else if (typeof (fileReader.result) === 'string') {
        setError('Failed to read as binary');
      } else {
        try {
          const puzzle = importFile(new Uint8Array(fileReader.result));
          if (!puzzle) {
            setError('Failed to parse file');
          } else {
            setPuzzle(puzzle);
          }
        } catch (error) {
          console.error(error);
          setError(error.message || 'Could not import file');
        }
      }
    };
    fileReader.readAsArrayBuffer(f[0]);
  }

  if (puzzle && ctx.user) {
    return <Preview user={ctx.user} isAdmin={ctx.isAdmin} {...puzzle} />;
  }

  const description = 'Import your existing puzzle to share it on Crosshare. Get your .puz files playable on the web. Crosshare gives your solvers a first-class experience on any device, and gives you access to statistics about solves.';
  return <>
    <Head>
      <title>Upload/Import Crossword Puzzles | Crosshare</title>
      <meta key="og:title" property="og:title" content='Crosshare Crossword Upload / Import' />
      <meta key="description" name="description" content={description} />
      <meta key="og:description" property="og:description" content={description} />
    </Head>
    <Hero text="Your crossword puzzles deserve to get shared">
      {error ?
        <>
          <p>Error: {error}</p>
          <p>If your puzzle isn&apos;t uploading correctly please message us on twitter or in the google group so we can help!</p>
        </>
        : ''}
      {ctx.loading ?
        <>
          <p>Checking if you have an exisiting account...</p>
        </>
        :
        (
          loginButton ?
            <>
              <p>To upload a puzzle, you need to log in with Google first. We use your sign in to keep track of the puzzles you&apos;ve uploaded.</p>
              {loginButton}
            </>
            :
            <>
              <label>
                <p>Select a .puz file to upload - you&apos;ll be able to review the puzzle before publishing</p>
                <input css={{ overflow: 'hidden', maxWidth: '70vw' }} type='file' accept='.puz' onChange={e => handleFile(e.target.files)} />
              </label>
            </>
        )
      }
    </Hero>
    <BigQuote
      quote="Crosshare changed the way I share my puzzles. The analytics allow me to better understand which parts of my grids are most difficult for solvers. It's a big part of why WWMC started and is still running today."
      attribution={<>Will of <Link href='/[...slug]' as={'/WWMC'} passHref>Will&apos;s Weekly Meta Crossword</Link></>}
    />
    <FeatureList>
      <FeatureListItem icon={<MdMoneyOff />} heading="It's 100% free" text="Sharing puzzles on Crosshare is always free. You can publish as many puzzles as you'd like and share with them with as many solvers as you can find." />
      <FeatureListItem icon={<RiPagesLine />} heading="Make your .puz files interactive" text="If you're only publishing .puz and .pdf files, you're missing out on a bunch of potential solvers. Crosshare instantly gives your puzzle a home on the web and expands your audience." />
      <FeatureListItem icon={<IoMdResize />} heading='All shapes and sizes are welcome' text='Crosshare supports grids of any size. The interface is optimized to fit as large a grid (and as many clues) as possible on any device your solvers are using.' />
      <FeatureListItem icon={<IoMdPhonePortrait />} heading="An app-like experience" text="Crosshare's solving interface is mobile-first and makes solving your puzzle as smooth as butter on desktops, tablets, and phones. Almost 50% of solvers are using mobile devices - don't let a poor interface keep them from solving your puzzles. Crosshare also supports dark mode, grid highlighting and tooltips for referenced entries, and more best-in-class features." />
      <FeatureListItem icon={<FaShareSquare />} heading="Crosswords are social" text="Crosshare puzzles are made to share. Our search engine optimization and social tags will get as many people solving your puzzle as possible. Social media posts automatically include grid preview images, puzzle titles, and teaser clues." />
      <FeatureListItem icon={<FaChartBar />} heading="Advanced analytics" text="As a constructor, you get access to advanced analytics about your puzzle. Find out how many people solve your puzzle, how long it takes them, and view heatmaps of exactly which cells they get stuck on." />
      <FeatureListItem icon={<FaComment />} heading="An instant crossword blog" text="After publishing a puzzle you can reserve your own URL and instantly create a crossword blog. You get a centralized page to share and talk about all of your puzzles. Commenting is enabled from the start and Crosshare is the only place where comments feature solve times, clue tooltips, and other crossword specific features." />
    </FeatureList>
  </>;
}
