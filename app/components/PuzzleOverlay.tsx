import {
  useContext,
  useState,
  useEffect,
  useCallback,
  Dispatch,
  ReactNode,
} from 'react';
import { Link } from './Link';
import {
  Direction,
  fromKeyboardEvent,
  KeyK,
  PuzzleResultWithAugmentedComments
} from '../lib/types';
import { PuzzleAction } from '../reducers/reducer';
import { isMetaSolution, timeString } from '../lib/utils';
import type firebase from 'firebase/app';
import { Comments } from './Comments';
import { EmbedContext } from './EmbedContext';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { NextPuzzleLink } from './Puzzle';
import { Overlay } from './Overlay';
import { PuzzleHeading } from './PuzzleHeading';
import { Button, ButtonAsLink } from './Buttons';
import { MetaSubmission } from './MetaSubmission';
import { lightFormat } from 'date-fns';
import { GoScreenFull } from 'react-icons/go';
import { AuthContext } from './AuthContext';
import { GoogleLinkButton, GoogleSignInButton } from './GoogleButtons';
import { t, Trans } from '@lingui/macro';
import useEventListener from '@use-it/event-listener';
import { isSome } from 'fp-ts/lib/Option';

const PrevDailyMiniLink = ({ nextPuzzle }: { nextPuzzle?: NextPuzzleLink }) => {
  if (!nextPuzzle) {
    return <></>;
  }
  return (
    <Link href={`/crosswords/${nextPuzzle.puzzleId}`}>
      Play {nextPuzzle.linkText}
    </Link>
  );
};

export enum OverlayType {
  BeginPause,
  Success,
}

export interface PuzzleOverlayBaseProps {
  publishTime: number;
  coverImage?: string | null;
  profilePicture?: string | null;
  clueMap: Map<string, [number, Direction, string]>;
  user?: firebase.User;
  puzzle: PuzzleResultWithAugmentedComments;
  nextPuzzle?: NextPuzzleLink;
  isMuted: boolean;
  solveTime: number;
  didCheat: boolean;
  downsOnly: boolean;
  dispatch: Dispatch<PuzzleAction>;
}

interface SuccessOverlayProps extends PuzzleOverlayBaseProps {
  overlayType: OverlayType.Success;
  contestSubmission?: string;
  contestHasPrize?: boolean;
  contestRevealed?: boolean;
  contestRevealDelay?: number | null;
}
interface BeginPauseProps extends PuzzleOverlayBaseProps {
  overlayType: OverlayType.BeginPause;
  dismissMessage: string;
  message: string;
  loadingPlayState: boolean;
}

export const PuzzleOverlay = (props: SuccessOverlayProps | BeginPauseProps) => {
  const authContext = useContext(AuthContext);
  const isEmbed = useContext(EmbedContext);
  const contestAnswers = props.puzzle.contestAnswers;
  const isContest = contestAnswers ? contestAnswers.length > 0 : false;
  const winningSubmissions =
    contestAnswers &&
    props.puzzle.contestSubmissions?.filter((sub) =>
      isMetaSolution(sub.s, contestAnswers)
    );

  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    if (isEmbed && document.fullscreenEnabled) {
      setShowFullscreen(true);
    }
  }, [isEmbed]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const { dispatch, overlayType } = props;
  const physicalKeyboardHandler = useCallback(
    (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tagName === 'textarea' || tagName === 'input') {
        return;
      }

      const mkey = fromKeyboardEvent(e);
      if (isSome(mkey)) {
        const key = mkey.value;
        if (
          key.k === KeyK.Pause ||
          key.k === KeyK.Enter ||
          key.k === KeyK.Escape ||
          key.k === KeyK.Space
        ) {
          const t = overlayType === OverlayType.Success
            ? 'DISMISSSUCCESS'
            : 'RESUMEACTION';
          dispatch({ type: t });
          e.preventDefault();
          return;
        }
      }
    },
    [dispatch, overlayType]
  );
  useEventListener('keydown', physicalKeyboardHandler);

  let loginButton: ReactNode = t`Login (via Google) to save your puzzle progress/stats`;
  if (!authContext.loading) {
    if (authContext.user?.email) {
      loginButton = t`Logged in as ${authContext.user.email}`;
    } else if (authContext.user) {
      loginButton = (
        <>
          <GoogleLinkButton
            user={authContext.user}
            text={t`Login (via Google)`}
          />{' '}
          <Trans>to save your puzzle progress/stats</Trans>
        </>
      );
    } else {
      loginButton = (
        <>
          <GoogleSignInButton text={t`Login (via Google)`} />{' '}
          <Trans>to save your puzzle progress/stats</Trans>
        </>
      );
    }
  }

  const solveTimeString = <b>{timeString(props.solveTime, false)}</b>;
  let solvedMessage = <Trans>Solved in</Trans>;
  if (!props.didCheat) {
    if (props.downsOnly) {
      solvedMessage = (
        <Trans>
          Solved <b>downs-only</b> in
        </Trans>
      );
    } else {
      solvedMessage = (
        <Trans>
          Solved <b>without check/reveal</b> in
        </Trans>
      );
    }
  }

  return (
    <Overlay
      coverImage={props.coverImage}
      closeCallback={
        props.overlayType === OverlayType.Success
          ? () => props.dispatch({ type: 'DISMISSSUCCESS' })
          : undefined
      }
    >
      {showFullscreen ? (
        <button
          css={{
            background: 'transparent',
            color: 'var(--text)',
            ...(props.coverImage && { color: 'var(--social-text)' }),
            border: 'none',
            position: 'absolute',
            padding: 0,
            fontSize: '2em',
            verticalAlign: 'text-top',
            width: '1em',
            height: '1em',
            top: '1em',
            left: '1em',
          }}
          onClick={toggleFullscreen}
        >
          <GoScreenFull
            aria-label="toggle fullscreen"
            title="Toggle Fullscreen"
            css={{ position: 'absolute', top: 0, left: 0 }}
          />
        </button>
      ) : (
        ''
      )}
      <PuzzleHeading
        rating={props.puzzle.rating}
        publishTime={props.publishTime}
        showTip={props.overlayType === OverlayType.Success}
        coverImage={props.coverImage}
        blogPost={props.puzzle.blogPost}
        isContest={isContest}
        constructorNotes={props.puzzle.constructorNotes}
        profilePic={props.profilePicture}
        title={props.puzzle.title}
        authorName={props.puzzle.authorName}
        constructorPage={props.puzzle.constructorPage}
        constructorIsPatron={props.puzzle.constructorIsPatron}
        guestConstructor={props.puzzle.guestConstructor}
      />
      <div css={{ textAlign: 'center' }}>
        {props.overlayType === OverlayType.BeginPause ? (
          <>
            {props.loadingPlayState ? (
              <div>
                <Trans>Checking for previous play data...</Trans>
              </div>
            ) : (
              <>
                <div css={{ marginBottom: '1em' }}>{props.message}</div>
                <Button
                  onClick={() => props.dispatch({ type: 'RESUMEACTION' })}
                  text={props.dismissMessage}
                />
                <p css={{ marginTop: '1em' }}>{loginButton}</p>
                {props.downsOnly ? (
                  <p css={{ marginTop: '1em' }}>
                    <Trans>You are currently solving downs-only:</Trans> (
                    <ButtonAsLink
                      onClick={() => props.dispatch({ type: 'STOPDOWNSONLY' })}
                      text={t`enable across clues`}
                    />
                    ).
                  </p>
                ) : (
                  ''
                )}
                {isContest ? (
                  <p css={{ marginTop: '1em' }}>
                    <Trans id="meta-explanation">
                      This is a contest/meta puzzle. To submit your answer,
                      first finish solving the grid (or reveal it if you get
                      stuck or solved offline).
                    </Trans>
                  </p>
                ) : (
                  ''
                )}
              </>
            )}
          </>
        ) : (
          <>
            {props.user?.uid === props.puzzle.authorId ? (
              <>
                {props.puzzle.isPrivate ||
                (props.puzzle.isPrivateUntil &&
                  props.puzzle.isPrivateUntil > Date.now()) ? (
                  <p>
                    Your puzzle is private
                    {props.puzzle.isPrivateUntil && !props.puzzle.isPrivate
                      ? ` until ${formatDistanceToNow(
                          new Date(props.puzzle.isPrivateUntil)
                        )} from now. Until then, it `
                      : '. It '}
                    won&apos;t appear on your Crosshare blog, isn&apos;t
                    eligible to be featured on the homepage, and notifications
                    won&apos;t get sent to any of your followers. It is still
                    viewable by anybody you send the link to or if you embed it
                    on another site.
                  </p>
                ) : (
                  <p>Your puzzle is live!</p>
                )}
                <p>
                  {isEmbed
                    ? `Solvers
              will see an empty grid, yours is complete since you authored the
              puzzle.`
                    : `Copy the link to share with solvers (solvers
                will see an empty grid, yours is complete since you authored the
                puzzle).`}{' '}
                  Comments posted below will be visible to anyone who finishes
                  solving the puzzle
                  {isContest ? ' and submits a solution to the meta' : ''}.
                </p>
              </>
            ) : (
              <>
                <p css={{ marginBottom: 0, fontSize: '1.5em' }}>
                  {solvedMessage} {solveTimeString}
                </p>
              </>
            )}
          </>
        )}
      </div>
      {props.overlayType === OverlayType.Success &&
      isContest &&
      props.puzzle.contestAnswers &&
      props.user?.uid !== props.puzzle.authorId ? (
        <MetaSubmission
          hasPrize={!!props.contestHasPrize}
          contestSubmission={props.contestSubmission}
          contestRevealed={props.contestRevealed}
          revealDisabledUntil={
            props.contestRevealDelay
              ? new Date(props.publishTime + props.contestRevealDelay)
              : null
          }
          dispatch={props.dispatch}
          solutions={props.puzzle.contestAnswers}
        />
      ) : (
        ''
      )}
      <div
        css={{
          ...((props.overlayType === OverlayType.BeginPause ||
            (isContest &&
              !props.contestRevealed &&
              !isMetaSolution(
                props.contestSubmission,
                props.puzzle.contestAnswers || []
              ) &&
              props.user?.uid !== props.puzzle.authorId)) && {
            display: 'none',
          }),
        }}
      >
        {isContest && props.puzzle.contestAnswers ? (
          <>
            <div css={{ marginTop: '1em' }}>
              <h4 css={{ borderBottom: '1px solid var(--black)' }}>
                <Trans>Leaderboard (updated hourly)</Trans>
              </h4>
              {winningSubmissions?.length ? (
                <ul
                  css={{
                    maxHeight: '10em',
                    listStyleType: 'none',
                    padding: '0.5em',
                    overflow: 'scroll',
                  }}
                >
                  {winningSubmissions
                    .sort((w1, w2) => w1.t - w2.t)
                    .map((w, i) => (
                      <li
                        css={{
                          padding: '0.5em 0',
                          borderBottom: '1px solid var(--bg-hover)',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                        key={i}
                      >
                        <strong>{w.n}</strong> solved at{' '}
                        {lightFormat(w.t, "H:mm 'on' M/d/yyyy")}
                      </li>
                    ))}
                </ul>
              ) : (
                <p>
                  <Trans>Nobody is on the leaderboard yet</Trans>
                </p>
              )}
            </div>
          </>
        ) : (
          ''
        )}
        <Comments
          downsOnly={props.downsOnly}
          hasGuestConstructor={props.puzzle.guestConstructor !== null}
          clueMap={props.clueMap}
          solveTime={props.solveTime}
          didCheat={props.didCheat}
          puzzleId={props.puzzle.id}
          puzzlePublishTime={props.publishTime}
          puzzleAuthorId={props.puzzle.authorId}
          comments={props.puzzle.comments}
        />
        {isEmbed ? (
          ''
        ) : (
          <div css={{ textAlign: 'center', marginTop: '2em' }}>
            <PrevDailyMiniLink nextPuzzle={props.nextPuzzle} />
          </div>
        )}
      </div>
      {isEmbed ? (
        <div css={{ marginTop: '2em', textAlign: 'center' }}>
          <Link href="/">
            <Trans>Powered by crosshare.org</Trans>
          </Link>
          {' · '}
          <Link href={`/crosswords/${props.puzzle.id}`}>
            <Trans>Open on crosshare.org</Trans>
          </Link>
        </div>
      ) : (
        ''
      )}
    </Overlay>
  );
};
