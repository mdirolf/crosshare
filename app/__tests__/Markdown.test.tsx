import { render, waitFor } from '../lib/testingUtils';

import { Markdown } from '../components/Markdown';
import { addClues, CluedGrid, fromCells } from '../lib/viewableGrid';
import { GridContext } from '../components/GridContext';

test('email priority over at mention', () => {
  const r = render(
    <Markdown
      text={'Reach out anytime at example@gmail.com to talk about crosswords!'}
    />,
    {}
  );
  expect(r.container).toMatchInlineSnapshot(`
<div>
  <div>
    <div
      class="paragraph"
    >
      Reach out anytime at example@gmail.com to talk about crosswords!
    </div>
  </div>
</div>
`);
});

test('emoji rendering', () => {
  let r = render(<Markdown text="😂🐅" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
      
      <img
        alt="🐅"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f405.png"
      />
      
    </div>
  </div>
</div>
`);

  r = render(<Markdown text="😂 abc" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
       abc
    </div>
  </div>
</div>
`);

  r = render(<Markdown text="abc 😂" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      abc 
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
      
    </div>
  </div>
</div>
`);

  r = render(<Markdown text="abc 😂 def" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      abc 
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
       def
    </div>
  </div>
</div>
`);

  r = render(<Markdown text="😂 abc 🐅" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
       abc 
      <img
        alt="🐅"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f405.png"
      />
      
    </div>
  </div>
</div>
`);

  r = render(<Markdown text="abc 😂 def 🐅 hij" />, {});
  expect(r.container).toMatchInlineSnapshot(`
.emotion-0 {
  width: 1em;
  height: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

<div>
  <div>
    <div
      class="paragraph"
    >
      abc 
      <img
        alt="😂"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f602.png"
      />
       def 
      <img
        alt="🐅"
        class="emotion-0"
        draggable="false"
        src="https://twemoji.maxcdn.com/v/latest/72x72/1f405.png"
      />
       hij
    </div>
  </div>
</div>
`);
});

test('spoiler text rendering', () => {
  let r = render(<Markdown text="foo bar >!baz" />, {});
  expect(r.container).toMatchSnapshot();

  r = render(<Markdown text="foo bar >!baz!<" />, {});
  expect(r.container).toMatchSnapshot();

  r = render(<Markdown text=">!baz foo bam ! >> fooey!<" />, {});
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text=">!baz foo bam ! >> fooey!< with after text" />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text="before ||baz foo bam >! fooey|| with after text" />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text="before >!baz foo bam || fooey!< with after text" />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text="before >!baz foo bam || fooey!< with ||after|| text" />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text="before ||baz foo bam >! not! !< fooey|| with >!after!< text" />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown
      text={'before ||baz foo bam \n\n>! not! !< fooey|| with >!after!< text'}
    />,
    {}
  );
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown
      text={'before baz foo bam \n\n>! not! !< fooey|| with >!after!< text'}
    />,
    {}
  );
  expect(r.container).toMatchSnapshot();
});

test('images should not be allowed', () => {
  let r = render(<Markdown text="![](http://example.com/test.png)" />, {});
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown text="![aaalt][1]\n\n[1]: http://example.com/test.gif\n\n" />,
    {}
  );
  expect(r.container).toMatchSnapshot();
});

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus tellus ante, dictum feugiat luctus quis, gravida id nibh. Sed tortor sem, pulvinar ut lacus nec, ornare consectetur ligula. Nam suscipit posuere vulputate. Proin ultricies dictum viverra. Cras tincidunt nec nulla non convallis. Nullam eget arcu mattis sapien ultricies varius nec ac mi. Duis dictum justo est, id tempus mi vestibulum eget. Nam posuere, nibh quis pharetra condimentum, leo ante tempor nibh, vitae facilisis sem elit at tellus. Etiam in tellus sagittis, lacinia enim ut, maximus ipsum. Ut sit amet mi tellus. Nulla a aliquam quam, vitae ultricies metus.

Mauris elit metus, scelerisque in sollicitudin et, bibendum in nulla. Praesent ex sem, tempus quis diam id, lobortis tempor ante. Ut sit amet bibendum purus. Vestibulum vulputate commodo faucibus. Donec dictum id ex eu mattis. Praesent id neque quis purus varius scelerisque. Cras hendrerit metus sed faucibus vestibulum. Ut in elementum mauris. Aenean faucibus tempus quam, posuere ultricies neque dapibus rhoncus. Suspendisse vel quam nibh. Sed iaculis mollis orci, a varius tortor volutpat nec. Donec quis nunc elit. Duis in nisi pellentesque lacus finibus efficitur ut nec massa.

Aenean sed dui maximus, vestibulum elit in, egestas est. Donec quis eros eros. In vitae sem sem. Donec varius justo id sodales vehicula. Sed id commodo magna, non condimentum urna. Nullam tempor magna non nisi maximus rutrum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed iaculis porta ipsum, sit amet interdum lectus feugiat sit amet. Integer a viverra augue. Nunc molestie elementum odio et pharetra. Praesent et ante at turpis egestas vulputate eget egestas purus. Vestibulum posuere nisl nec viverra laoreet. Fusce luctus finibus nibh, quis efficitur nunc pellentesque non. Cras dui mi, placerat quis porta at, porta quis neque. Vestibulum et justo non lectus bibendum eleifend non et nisl.

Morbi posuere nisl id odio suscipit, et hendrerit nibh consequat. Vivamus at odio et risus dignissim commodo eget ac erat. Aliquam erat volutpat. Vestibulum lobortis sodales hendrerit. Nunc luctus consectetur mauris, non interdum libero laoreet vitae. Vivamus ut sollicitudin quam. Suspendisse congue venenatis semper. Ut viverra justo sit amet sagittis ultrices. Maecenas pellentesque diam sit amet dui euismod, in bibendum nisl molestie. Etiam ultricies finibus augue, in vulputate risus ultricies vel. Nunc tempus, quam at porttitor condimentum, sem elit lobortis nibh, sit amet sodales purus ante non neque. Vestibulum sagittis tortor eget massa ornare tristique.

Nullam aliquam sapien a efficitur luctus. Nullam vulputate tempor est, eu fermentum nunc vulputate id. Proin congue, nulla quis imperdiet sagittis, purus erat ullamcorper sapien, ullamcorper placerat neque mauris vitae lorem. Phasellus eu urna a eros vestibulum rutrum. In sed tempor sapien. Cras in elit venenatis, venenatis quam ac, dignissim est. Sed lacus tortor, maximus sed purus nec, venenatis fermentum tortor. Donec id lectus ut lectus gravida aliquet. Pellentesque posuere et dui ac vehicula. Proin purus neque, dictum sed sem tristique, suscipit viverra velit. Mauris ut posuere massa. Phasellus efficitur mattis velit sed ultrices.`;

test('markdown preview mode', () => {
  let r = render(<Markdown preview={1000} text="foo bar >!baz" />, {});
  expect(r.container).toMatchSnapshot();

  r = render(<Markdown preview={1000} text={longText} />, {});
  expect(r.container).toMatchSnapshot();

  r = render(
    <Markdown
      preview={100}
      text="||Lorem **ipsum** dolor sit amet, consectetur _adipiscing_ elit. Phasellus tellus ante, dictum feugiat luctus quis, gravida id nibh. Sed tortor sem, pulvinar ut lacus nec, ornare consectetur ligula. Nam suscipit posuere vulputate. Proin ultricies dictum viverra. Cras tincidunt nec nulla non convallis. Nullam eget arcu mattis sapien ultricies varius nec ac mi. Duis dictum justo est, id tempus mi vestibulum eget. Nam posuere, nibh quis pharetra condimentum, leo ante tempor nibh, vitae facilisis sem elit at tellus. **Etiam** in tellus sagittis, lacinia enim ut, maximus ipsum. Ut sit amet mi tellus. Nulla a aliquam quam, vitae ultricies metus.||"
    />,
    {}
  );
  expect(r.container).toMatchSnapshot();
});

test('clueMap rendering', async () => {
  const answers = ['12ACLUE', '1', 'BA', 'M'];
  const grid = fromCells({
    width: 2,
    height: 2,
    cells: answers,
    allowBlockEditing: false,
    highlighted: new Set<number>(),
    vBars: new Set<number>(),
    hBars: new Set<number>(),
    hidden: new Set<number>(),
    highlight: 'circle',
    mapper: (x) => x,
  });

  const cluedGrid: CluedGrid = addClues(grid, [
    { num: 1, dir: 0, clue: 'Well now', explanation: null },
    { num: 3, dir: 0, clue: '2-down Then...', explanation: null },
    { num: 1, dir: 1, clue: '1- and 3- acrosses You and I', explanation: null },
    { num: 2, dir: 1, clue: 'here is the clue?', explanation: null },
  ]);

  let r = render(
    <Markdown text="before ||baz BOOM foo BAM >! not! !< fooey|| with >!after!< text" />,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();

  r = render(
    <GridContext.Provider value={cluedGrid}>
      <Markdown text="before ||baz BOOM foo BAM >! not! !< fooey|| with >!after!< text" />
    </GridContext.Provider>,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();

  r = render(
    <GridContext.Provider value={cluedGrid}>
      <Markdown text="12ACLUE1 BAM" />
    </GridContext.Provider>,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();

  r = render(
    <GridContext.Provider value={cluedGrid}>
      <Markdown text="||BAM||" />
    </GridContext.Provider>,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();

  r = render(
    <GridContext.Provider value={cluedGrid}>
      <Markdown
        text={
          "You got it!! Glad the clues pointed you in the right direction. That's what they're there for. Also, it was Brian's suggestion to include >! BAM !< which I think is such an awesome addition. Cheers!"
        }
      />
    </GridContext.Provider>,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();

  r = render(
    <GridContext.Provider value={cluedGrid}>
      <Markdown text="Reference 1A and 2-D and 1-Across and 2Down and unknown 11A" />
    </GridContext.Provider>,
    {}
  );
  await waitFor(() => {
    /* noop */
  });
  expect(r.container).toMatchSnapshot();
});
