import { ChangeEvent, useEffect, useRef, useState } from 'react';
import './App.css';
import Editor, { EditorRef } from './components/Editor/Editor';
import { getIcons } from './getIcons';
import { pathToData } from './pathToData';
import { templates } from './templates';

function App() {
  const editorRef = useRef<EditorRef>(null);
  const [path, setPath] = useState<string>('');
  const [size, setSize] = useState<number>(10);
  const [width, setWidth] = useState<number>(22);
  const [height, setHeight] = useState<number>(22);
  const [icons, setIcons] = useState<any[]>([]);
  const [isIconsOpen, setIsIconsOpen] = useState<boolean>(false);

  useEffect(() => {
    getIcons().then((memoryIcons: any[]) => {
      setIcons(memoryIcons);
    });
  })

  function handleChange(value: string) {
    setPath(value);
  }

  function handleSizeChange(event: ChangeEvent<HTMLInputElement>) {
    const value = parseInt(event.target.value, 10);
    setSize(value);
  }

  function handleChangeData(value: number[][]) {
    //console.log(JSON.stringify(value));
  }

  function handleTemplate(event: any) {
    const i = parseInt(event.currentTarget.dataset.template, 10);
    if (i === -1) {
      editorRef.current?.clear();
      return;
    }
    if (i !== undefined) {
      editorRef.current?.applyTemplate(templates[i].template);
    }
  }

  function handleDecreaseWidth() {
    setWidth(width - 1);
  }

  function handleIncreaseWidth() {
    setWidth(width + 1);
  }

  function handleDecreaseHeight() {
    setHeight(height - 1);
  }

  function handleIncreaseHeight() {
    setHeight(height + 1);
  }

  function handleIcon(e: any) {
    const template = pathToData(e.currentTarget.dataset.data, 22, 22);
    editorRef.current?.applyTemplate(template);
    setIsIconsOpen(false);
  }

  const iconList = icons.map((item, i) => {
    return (
      <button key={item.id} data-data={item.data} title={item.name} onClick={handleIcon}>
        <svg viewBox="0 0 22 22">
          <path d={item.data} />
        </svg>
      </button>
    )
  });

  function handleIconList() {
    setIsIconsOpen(!isIconsOpen);
  }

  function handleFlipHorizontal(e: any) {
    editorRef.current?.flipHorizontal();
  }

  function handleFlipVertical(e: any) {
    editorRef.current?.flipVertical();
  }

  function handleIncreaseX(e: any) {
    editorRef.current?.translate(1, 0);
  }

  function handleDecreaseX(e: any) {
    editorRef.current?.translate(-1, 0);
  }

  function handleIncreaseY(e: any) {
    editorRef.current?.translate(0, 1);
  }

  function handleDecreaseY(e: any) {
    editorRef.current?.translate(0, -1);
  }

  function handleRotateClockwise(e: any) {
    editorRef.current?.rotate();
  }

  function handleRotateCounterclockwise(e: any) {
    editorRef.current?.rotate(true);
  }

  function handleUndo() {
    editorRef.current?.undo();
  }

  function handleRedo() {
    editorRef.current?.redo();
  }

  return (
    <div className="app">
      <div className="logo">
        <svg viewBox="0 0 16 16">
          <path fill="currentColor" d="M13 1V2H14V3H15V13H14V14H13V15H3V14H2V13H1V3H2V2H3V1H13M3 12H4V13H12V12H13V4H12V3H4V4H3V12M5 5H8V8H11V11H8V8H5V5Z"></path>
        </svg>
      </div>
      <div className="toolbar-horizontal">
        <section>
          <button onClick={handleDecreaseWidth}>
            <svg viewBox="0 0 28 28">
              <path fill="currentColor" d="M21 13V15H7V13H21Z" />
            </svg>
          </button>
          <label className="width">
            <span>Width</span>
            <input type="number" readOnly value={width} />
          </label>
          <button onClick={handleIncreaseWidth}>
            <svg viewBox="0 0 28 28">
              <path fill="currentColor" d="M21 13V15H15V21H13V15H7V13H13V7H15V13H21Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleDecreaseHeight}>
            <svg viewBox="0 0 28 28">
              <path fill="currentColor" d="M21 13V15H7V13H21Z" />
            </svg>
          </button>
          <label className="height">
            <span>Height</span>
            <input type="number" readOnly value={height} />
          </label>
          <button onClick={handleIncreaseHeight}>
            <svg viewBox="0 0 28 28">
              <path fill="currentColor" d="M21 13V15H15V21H13V15H7V13H13V7H15V13H21Z" />
            </svg>
          </button>
        </section>
        <section>
          <label className="zoom">
            <span>Zoom</span>
            <input type="range" min={10} max={40} value={size} onInput={handleSizeChange} />
          </label>
        </section>
      </div>
      <div className="toolbar-vertical">
        <section>
          <button onClick={handleTemplate} data-template={-1}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M8 9H9V8H39V9H40V39H39V40H9V39H8V9M10 38H38V10H10V38M12 12H18V18H24V12H30V18H36V24H30V18H24V24H30V30H24V36H18V30H12V24H18V18H12V12M24 30V24H18V30H24M30 30H36V36H30V30Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleIconList}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M8 9H9V8H39V9H40V39H39V40H9V39H8V9M10 38H38V10H10V38M13 16H14V15H24V16H25V18H34V19H35V33H34V34H14V33H13V16M16 31H32V21H22V18H16V31Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          {
            templates.map((template, i) => (
              <button key={template.name} onClick={handleTemplate} data-template={i} title={template.name}>
                <svg viewBox="0 0 48 48">
                  <path fill="currentColor" d={template.toolbarIcon} />
                </svg>
              </button>
            ))
          }
        </section>
      </div>
      {isIconsOpen && (
        <div className="dropdown">
          {iconList}
        </div>
      )
      }
      <div className="editor">
        <Editor ref={editorRef}
          width={width}
          height={height}
          size={size}
          onChange={handleChange}
          onChangeData={handleChangeData}></Editor>
        <div>
          <div>
            <svg className="example-button-round" viewBox="0 0 146 36">
              <g transform="translate(7,7)">
                <path d={path} />
              </g>
              <path d="M14 4H140V5H141V6H142V30H141V31H140V32H14V31H12V30H10V29H9V28H8V27H7V26H6V24H5V22H4V14H5V12H6V10H7V9H8V8H9V7H10V6H12V5H14V4M8 23V25H9V26H10V27H11V28H13V29H15V30H139V29H140V7H139V6H15V7H13V8H11V9H10V10H9V11H8V13H7V15H6V21H7V23H8M32 10H34V16H40V10H42V24H40V18H34V24H32V10M55 14H57V15H58V14H63V15H64V24H62V17H61V16H58V17H57V24H55V14M73 10H75V24H73V23H72V24H68V23H67V22H66V16H67V15H68V14H72V15H73V10M68 21H69V22H72V21H73V17H72V16H69V17H68V21M77 15H78V14H83V15H84V14H86V26H85V27H84V28H78V26H83V25H84V24H79V23H78V22H77V15M84 17H83V16H79V21H80V22H83V21H84V17M91 10V22H92V24H90V23H89V12H88V10H91M96 14H102V15H103V16H104V22H103V23H102V24H96V23H95V22H94V16H95V15H96V14M96 21H97V22H101V21H102V17H101V16H97V17H96V21M105 14H107V16H108V18H109V20H111V18H112V16H113V14H115V17H114V19H113V21H112V23H111V24H109V23H108V21H107V19H106V17H105V14M118 14H125V15H126V19H125V20H119V21H120V22H125V24H119V23H118V22H117V15H118V14M124 18V16H119V18H124M128 15H129V14H135V15H136V17H134V16H130V17H131V18H133V19H135V20H136V23H135V24H129V23H128V21H130V22H134V21H133V20H131V19H129V18H128V15M45 14H51V15H52V16H53V24H51V23H50V24H45V23H44V19H45V18H51V17H50V16H46V17H44V15H45V14M50 22V21H51V20H46V22H50Z" />
            </svg>
            <svg className="example-button-round" viewBox="0 0 146 36">
              <g transform="translate(7,7)">
                <path d={path} />
              </g>
              <path d="M6 4H140V5H141V6H142V30H141V31H140V32H6V31H5V30H4V6H5V5H6V4M6 29H7V30H139V29H140V7H139V6H7V7H6V29M32 10H34V16H40V10H42V24H40V18H34V24H32V10M55 14H57V15H58V14H63V15H64V24H62V17H61V16H58V17H57V24H55V14M73 10H75V24H73V23H72V24H68V23H67V22H66V16H67V15H68V14H72V15H73V10M68 21H69V22H72V21H73V17H72V16H69V17H68V21M77 15H78V14H83V15H84V14H86V26H85V27H84V28H78V26H83V25H84V24H79V23H78V22H77V15M84 17H83V16H79V21H80V22H83V21H84V17M91 10V22H92V24H90V23H89V12H88V10H91M96 14H102V15H103V16H104V22H103V23H102V24H96V23H95V22H94V16H95V15H96V14M96 21H97V22H101V21H102V17H101V16H97V17H96V21M105 14H107V16H108V18H109V20H111V18H112V16H113V14H115V17H114V19H113V21H112V23H111V24H109V23H108V21H107V19H106V17H105V14M118 14H125V15H126V19H125V20H119V21H120V22H125V24H119V23H118V22H117V15H118V14M124 18V16H119V18H124M128 15H129V14H135V15H136V17H134V16H130V17H131V18H133V19H135V20H136V23H135V24H129V23H128V21H130V22H134V21H133V20H131V19H129V18H128V15M45 14H51V15H52V16H53V24H51V23H50V24H45V23H44V19H45V18H51V17H50V16H46V17H44V15H45V14M50 22V21H51V20H46V22H50Z" />
            </svg>
          </div>
          <div>
            <svg className="example-grid" viewBox="0 0 130 82">
              <g transform="translate(6,6)">
                <path d={path} />
              </g>
              <g transform="translate(30,6)">
                <path d={path} />
              </g>
              <g transform="translate(54,6)">
                <path d={path} />
              </g>
              <g transform="translate(78,6)">
                <path d={path} />
              </g>
              <g transform="translate(102,6)">
                <path d={path} />
              </g>
              <g transform="translate(6,30)">
                <path d={path} />
              </g>
              <g transform="translate(30,30)">
                <path d={path} />
              </g>
              <g transform="translate(54,30)">
                <path d={path} />
              </g>
              <g transform="translate(78,30)">
                <path d={path} />
              </g>
              <g transform="translate(102,30)">
                <path d={path} />
              </g>
              <g transform="translate(6,54)">
                <path d={path} />
              </g>
              <g transform="translate(30,54)">
                <path d={path} />
              </g>
              <g transform="translate(54,54)">
                <path d={path} />
              </g>
              <g transform="translate(78,54)">
                <path d={path} />
              </g>
              <g transform="translate(102,54)">
                <path d={path} />
              </g>
              <path fill="#AAA" d="M4 4H8V6H6V8H4V4M26 4H32V6H30V8H28V6H26V4M50 4H56V6H54V8H52V6H50V4M74 4H80V6H78V8H76V6H74V4M4 78V74H6V76H8V78H4M98 4H104V6H102V8H100V6H98V4M32 78H26V76H28V74H30V76H32V78M56 78H50V76H52V74H54V76H56V78M80 78H74V76H76V74H78V76H80V78M104 78H98V76H100V74H102V76H104V78M126 78H122V76H124V74H126V78M126 4V8H124V6H122V4H126M126 50V56H124V54H122V52H124V50H126M126 26V32H124V30H122V28H124V26H126M4 32V26H6V28H8V30H6V32H4M4 56V50H6V52H8V54H6V56H4M28 32V30H26V28H28V26H30V28H32V30H30V32H28M52 32V30H50V28H52V26H54V28H56V30H54V32H52M76 32V30H74V28H76V26H78V28H80V30H78V32H76M100 32V30H98V28H100V26H102V28H104V30H102V32H100M28 56V54H26V52H28V50H30V52H32V54H30V56H28M52 56V54H50V52H52V50H54V52H56V54H54V56H52M76 56V54H74V52H76V50H78V52H80V54H78V56H76M100 56V54H98V52H100V50H102V52H104V54H102V56H100Z" />
            </svg>
          </div>
        </div>
        <div>
          <textarea value={path} readOnly></textarea>
        </div>
        <p>Real UX work in progress</p>
        <button onClick={handleFlipHorizontal}>Flip Horizontal</button>
        <button onClick={handleFlipVertical}>Flip Vertical</button>
        <button onClick={handleDecreaseY}>Move Up</button>
        <button onClick={handleIncreaseY}>Move Down</button>
        <button onClick={handleDecreaseX}>Move Left</button>
        <button onClick={handleIncreaseX}>Move Right</button>
        <button onClick={handleRotateClockwise}>Clockwise</button>
        <button onClick={handleRotateCounterclockwise}>Counterclockwise</button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
    </div>
  );
}

export default App;
