import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from 'react';
import './App.css';
import Editor, { EditorRef } from './components/Editor/Editor';
import Flyout from './components/Flyout/Flyout';
import download from './download';
import { getIcons } from './getIcons';
import { pathToData } from './pathToData';
import { templates } from './templates';

function App() {
  const editorRef = useRef<EditorRef>(null);
  const [name, setName] = useState<string>('unknown');
  const [path, setPath] = useState<string>('');
  const [size, setSize] = useState<number>(10);
  const [width, setWidth] = useState<number>(22);
  const [height, setHeight] = useState<number>(22);
  const [colors, setColors] = useState<string[]>(['transparent', '#000']);
  const [newWidth, setNewWidth] = useState<string>('22');
  const [newHeight, setNewHeight] = useState<string>('22');
  const [disableTransparency, setDisableTransparency] = useState<boolean>(true);
  const [importMonochrome, setImportMonochrome] = useState<boolean>(true);
  const [icons, setIcons] = useState<any[]>([]);
  const [isFlyoutMemoryOpen, setIsFlyoutMemoryOpen] = useState<boolean>(false);
  const [isFlyoutNewOpen, setIsFlyoutNewOpen] = useState<boolean>(false);
  const [isFlyoutTemplateOpen, setIsFlyoutTemplateOpen] = useState<boolean>(false);
  const [isFlyoutPreviewOpen, setIsFlyoutPreviewOpen] = useState<boolean>(false);
  const [isFlyoutImportOpen, setIsFlyoutImportOpen] = useState<boolean>(false);
  const [isFlyoutExportOpen, setIsFlyoutExportOpen] = useState<boolean>(false);
  const [isFlyoutPropertiesOpen, setIsFlyoutPropertiesOpen] = useState<boolean>(false);
  const [hasUndo, setHasUndo] = useState<boolean>(false);
  const [hasRedo, setHasRedo] = useState<boolean>(false);

  useEffect(() => {
    getIcons().then((memoryIcons: any[]) => {
      setIcons(memoryIcons);
    });
  })

  function handleChange(value: string) {
    setPath(value);
    console.log(editorRef.current?.hasUndo(), editorRef.current?.hasRedo());
    setHasUndo(!editorRef.current?.hasUndo());
    setHasRedo(!editorRef.current?.hasRedo());
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
    setIsFlyoutTemplateOpen(false);
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
    setIsFlyoutMemoryOpen(false);
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

  function handleInputModePixel() {
    editorRef.current?.inputModePixel();
  }

  function handleInputModeLine() {
    editorRef.current?.inputModeLine();
  }

  function handleInputModeRectangle() {
    editorRef.current?.inputModeRectangle();
  }

  function handleInputModeEllipse() {
    editorRef.current?.inputModeEllipse();
  }

  function handleNew() {
    setIsFlyoutNewOpen(!isFlyoutNewOpen);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutImportOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutMemoryOpen(false);
  }

  function handleProperties() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutPropertiesOpen(!isFlyoutPropertiesOpen);
    setIsFlyoutImportOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutMemoryOpen(false);
  }

  function handlePreview() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutPreviewOpen(!isFlyoutPreviewOpen);
    setIsFlyoutImportOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutMemoryOpen(false);
  }

  function handleImport() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutImportOpen(!isFlyoutImportOpen);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutMemoryOpen(false);
  }

  function handleExport() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutImportOpen(false);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutExportOpen(!isFlyoutExportOpen);
    setIsFlyoutMemoryOpen(false);
  }

  function handleTemplateOpen() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutImportOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutTemplateOpen(!isFlyoutTemplateOpen);
    setIsFlyoutMemoryOpen(false);
  }

  function handleMemory() {
    setIsFlyoutNewOpen(false);
    setIsFlyoutImportOpen(false);
    setIsFlyoutTemplateOpen(false);
    setIsFlyoutPreviewOpen(false);
    setIsFlyoutPropertiesOpen(false);
    setIsFlyoutExportOpen(false);
    setIsFlyoutMemoryOpen(!isFlyoutMemoryOpen);
  }

  function handleNewWidth(e: ChangeEvent<HTMLInputElement>) {
    setNewWidth(e.target.value);
  }

  function handleNewHeight(e: ChangeEvent<HTMLInputElement>) {
    setNewHeight(e.target.value);
  }

  function handleCreate() {
    setWidth(parseInt(newWidth, 10) || 22);
    setHeight(parseInt(newHeight, 10) || 22);
    editorRef.current?.clear();
    setIsFlyoutNewOpen(false);
  }

  function handleNewMemory() {
    setWidth(22);
    setHeight(22);
    editorRef.current?.clear();
    setIsFlyoutNewOpen(false);
  }

  function handleNewSharp() {
    setWidth(400);
    setHeight(240);
    editorRef.current?.clear();
    setIsFlyoutNewOpen(false);
  }

  function decreaseNewHeight() {
    const value = parseInt(newHeight, 10);
    setNewHeight(`${value - 1}`);
  }

  function increaseNewHeight() {
    const value = parseInt(newHeight, 10);
    setNewHeight(`${value + 1}`);
  }

  function decreaseNewWidth() {
    const value = parseInt(newWidth, 10);
    setNewWidth(`${value - 1}`);
  }

  function increaseNewWidth() {
    const value = parseInt(newWidth, 10);
    setNewWidth(`${value + 1}`);
  }

  function handleSvgDownload() {
    download(
      `${name}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" /></svg>`
    );
  }

  function handlePngDownload() {
    alert('coming soon');
  }

  function handleBmpDownload() {
    alert('coming soon');
  }

  function handleImportChange(e: any) {
    const [file] = e.target.files;
    if (file) {
      switch (file.type) {
        case 'image/svg+xml':
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            const result = `${reader.result}`;
            const pathMatch = result.match(/ d="([^"]+)"/);
            const sizeMatch = result.match(/viewBox="\d+\.?\d* \d+\.?\d* (\d+(?:\.?\d*)?) (\d+(?:\.\d*)?)"/);
            if (pathMatch && sizeMatch) {
              const temp = pathToData(pathMatch[1], parseInt(sizeMatch[1], 10), parseInt(sizeMatch[2], 10));
              editorRef.current?.applyTemplate(temp);
            } else {
              // invalid file
              alert('invalid file...');
            }
          });
          reader.readAsText(file);
          break;
        case 'image/png':
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          var url = URL.createObjectURL(file);
          var img = new Image();
          img.onload = function () {
            ctx?.drawImage(img, 0, 0, img.width, img.height);
            const temp: number[][] = [];
            for (let y = 0; y < height; y++) {
              temp.push([]);
              for (let x = 0; x < width; x++) {
                const pixel = ctx?.getImageData(x, y, 1, 1);
                if (!pixel) {
                  continue;
                }
                //            white or transparent
                if (pixel.colorSpace !== 'srgb') {
                  throw new Error('I only wrote this for srgb, file a bug');
                }
                const color = (pixel?.data[0] === 255 && pixel?.data[1] === 255 && pixel?.data[2] === 255) || pixel?.data[3] === 0 ? 0 : 1;
                temp[y].push(color);
              }
            }
            editorRef.current?.applyTemplate(temp);
          }
          img.src = url;
          break;
        default:
          throw new Error('Unsupported file. Open a github issue.');
      }
    }
    e.target.value = null;
    setIsFlyoutImportOpen(false);
  }

  function handleDisableTransparency(e: ChangeEvent<HTMLInputElement>) {
    setDisableTransparency(!disableTransparency);
  }

  function handleImportMonochrome(e: ChangeEvent<HTMLInputElement>) {
    setImportMonochrome(!importMonochrome);
  }

  function handleName(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (!e.target.value) {
      console.log('invalid name');
    }
  }

  const noData = path.length === 0;

  return (
    <div className="app">
      {isFlyoutNewOpen && (
        <Flyout horizontal={1.25}>
          <div>
            <h2>Templates</h2>
            <div className="flyout-list">
              <button onClick={handleNewMemory}>
                <svg viewBox="0 0 48 48">
                  <path fill="currentColor" d="M8 9H9V8H39V9H40V39H39V40H9V39H8V9M10 38H38V10H10V38M12 12H24V24H36V36H24V24H12V12Z" />
                </svg>
                <span>
                  <span>Memory Icon</span>
                  <span>22x22</span>
                </span>
              </button>
              <button onClick={handleNewSharp}>
                <svg viewBox="0 0 48 48">
                  <path fill="currentColor" d="M9 8H39V9H40V39H39V40H9V39H8V9H9V8M37 37V11H11V37H37M13 13H35V25H13V13M16 28H18V30H20V32H18V34H16V32H14V30H16V28M31 28H34V31H31V28M27 34V31H30V34H27Z" />
                </svg>
                <span>
                  <span>Playdate Design</span>
                  <span>400x240</span>
                </span>
              </button>
            </div>
            <h2>Custom Asset</h2>
            <div className="flyout-properties">
              <div>
                <label>
                  <span>Width</span>
                  <input type="text" value={newWidth} onChange={handleNewWidth} className="border-right-none" />
                </label>
                <button className="decrease" onClick={decreaseNewWidth} disabled={newHeight === '1'}>
                  <svg viewBox="0 0 32 26">
                    <path fill="currentColor" d="M8 11H23L23 14H8V11Z" />
                  </svg>
                </button>
                <button className="increase" onClick={increaseNewWidth}>
                  <svg viewBox="0 0 32 26">
                    <path fill="currentColor" d="M8 11H14V5H17V11H23V14H17V20H14V14H8V11Z" />
                  </svg>
                </button>
              </div>
              <div>
                <label>
                  <span>Height</span>
                  <input type="text" value={newHeight} onChange={handleNewHeight} className="border-right-none" />
                </label>
                <button className="decrease" onClick={decreaseNewHeight} disabled={newHeight === '1'}>
                  <svg viewBox="0 0 32 26">
                    <path fill="currentColor" d="M8 11H23L23 14H8V11Z" />
                  </svg>
                </button>
                <button className="increase" onClick={increaseNewHeight}>
                  <svg viewBox="0 0 32 26">
                    <path fill="currentColor" d="M8 11H14V5H17V11H23V14H17V20H14V14H8V11Z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flyout-list">
              <button onClick={handleCreate}>
                <svg viewBox="0 0 48 48">
                  <path fill="currentColor" d="M8 9H9V8H39V9H40V39H39V40H9V39H8V9M10 38H38V10H10V38M12 12H18V18H26V26H36V36H26V26H18V18H12V12Z" />
                </svg>
                <span>
                  <span>Create</span>
                  <span>Custom Asset</span>
                </span>
              </button>
            </div>
            <p>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M0 9H1V6H2V4H4V2H6V1H9V0H15V1H18V2H20V4H22V6H23V9H24V15H23V18H22V20H20V22H18V23H15V24H9V23H6V22H4V20H2V18H1V15H0V9M5 7H4V10H3V14H4V17H5V19H7V20H10V21H14V20H17V19H19V17H20V14H21V10H20V7H19V5H17V4H14V3H10V4H7V5H5V7M10 18V12H14V18H10M10 6H14V10H10V6Z" />
              </svg>
              Request Other Templates on GitHub
            </p>
          </div>
        </Flyout>
      )}
      {isFlyoutPropertiesOpen && (
        <Flyout horizontal={5.25}>
          <div className="flyout-config">
            <h2>Properties</h2>
            <div>
              <label>
                <h3>Name</h3>
                <input type="text" value={name} onInput={handleName} />
              </label>
            </div>
            <h3>Canvas</h3>
            <div className="flyout-properties">
              <div>
                <label>
                  <span>Width</span>
                  <input type="number" readOnly value={width} className="border-right-none" />
                </label>
                <div>
                  <button onClick={handleDecreaseWidth} className="decrease">
                    <svg viewBox="0 0 32 26">
                      <path fill="currentColor" d="M8 11H23L23 14H8V11Z" />
                    </svg>
                  </button>
                  <button onClick={handleIncreaseWidth} className="increase">
                    <svg viewBox="0 0 32 26">
                      <path fill="currentColor" d="M8 11H14V5H17V11H23V14H17V20H14V14H8V11Z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label>
                  <span>Height</span>
                  <input type="number" readOnly value={height} className="border-right-none" />
                </label>
                <div>
                  <button onClick={handleDecreaseHeight} className="decrease">
                    <svg viewBox="0 0 32 26" className="decrease">
                      <path fill="currentColor" d="M8 11H23L23 14H8V11Z" />
                    </svg>
                  </button>
                  <button onClick={handleIncreaseHeight} className="increase">
                    <svg viewBox="0 0 32 26">
                      <path fill="currentColor" d="M8 11H14V5H17V11H23V14H17V20H14V14H8V11Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <h3>Colors</h3>
            <div className="whiteTransparent">
              <label>
                <input type="checkbox" checked={disableTransparency} onChange={handleDisableTransparency}/>
                <span>Disable Transparency</span>
              </label>
            </div>
            <div className="colors">
              <button className="color" title="transparent" style={{ ['--color' as any]: 'transparent' }}></button>
              <button className="color" title="#000000" style={{ ['--color' as any]: '#000000' }}></button>
              <button className="new-color" disabled>Add Color</button>
            </div>
          </div>
        </Flyout>
      )}
      {isFlyoutImportOpen && (
        <Flyout horizontal={12.75}>
          <div className="flyout-import">
            <h2>Import</h2>
            <label className="flyout-file">
              <svg viewBox="0 0 48 48">
                <path fill="currentColor" d="M19 31V34H24V37H10V34H15V31H6V13H28V31H19M9 16V28H25V16H9M31 12H42V37H31V12M34 20H39V17H34V20M34 23V26H39V23H34Z" />
              </svg>
              <span>
                <span>Select SVG or PNG</span>
                <span>Layers are Flattened</span>
              </span>
              <input type="file" onChange={handleImportChange} />
            </label>
            <label className="flyout-checkbox">
              <input type="checkbox" checked={importMonochrome} onChange={handleImportMonochrome}/>
              <span>Import as Monochrome</span>
            </label>
            <div className="flyout-horizontal-spacer"></div>
          </div>
        </Flyout>
      )}
      {isFlyoutMemoryOpen && (
        <Flyout vertical={5}>
          <div className="flyout-open">
            {iconList}
          </div>
        </Flyout>
      )}
      {isFlyoutExportOpen && (
        <Flyout horizontal={16.0}>
          <div className="flyout-export">
            <h2>Export</h2>
            <h3>SVG</h3>
            <pre>&lt;svg viewBox=&quot;0 0 {width} {height}&quot;&gt;&lt;svg d=&quot;{path}&quot; /&gt;&lt;/svg&gt;</pre>
            <h3>Downloads</h3>
            <div className="flyout-list" style={{ marginBottom: '1rem' }}>
              <button onClick={handleSvgDownload} disabled={path === ''}>
                <span>
                  <span>SVG</span>
                  <span>Vector</span>
                </span>
              </button>
              <button onClick={handlePngDownload} disabled={path === ''}>
                <span>
                  <span>PNG</span>
                  <span>Raster</span>
                </span>
              </button>
              <button onClick={handleBmpDownload} disabled={path === ''}>
                <span>
                  <span>BMP</span>
                  <span>1 Bit Depth Raster</span>
                </span>
              </button>
            </div>
            <h3>Contribute</h3>
            <div className="flyout-list" style={{ marginBottom: '1rem' }}>
              <button disabled={path === ''}>
                <span>
                  <span>Contribute to Memory Icons</span>
                  <span>Generate a GitHub Issue</span>
                </span>
              </button>
            </div>
          </div>
        </Flyout>
      )}
      {isFlyoutPreviewOpen && (
        <Flyout horizontal={9.25}>
          <div className="flyout-preview">
            <h2>Preview</h2>
            <h3>Interface</h3>
            <div className="flyout-padding">
              <div>
                <div>
                  <svg className="example-button-round" viewBox="0 0 146 36">
                    <g transform="translate(7,7)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <path fill="currentColor" d="M14 4H140V5H141V6H142V30H141V31H140V32H14V31H12V30H10V29H9V28H8V27H7V26H6V24H5V22H4V14H5V12H6V10H7V9H8V8H9V7H10V6H12V5H14V4M8 23V25H9V26H10V27H11V28H13V29H15V30H139V29H140V7H139V6H15V7H13V8H11V9H10V10H9V11H8V13H7V15H6V21H7V23H8M32 10H34V16H40V10H42V24H40V18H34V24H32V10M55 14H57V15H58V14H63V15H64V24H62V17H61V16H58V17H57V24H55V14M73 10H75V24H73V23H72V24H68V23H67V22H66V16H67V15H68V14H72V15H73V10M68 21H69V22H72V21H73V17H72V16H69V17H68V21M77 15H78V14H83V15H84V14H86V26H85V27H84V28H78V26H83V25H84V24H79V23H78V22H77V15M84 17H83V16H79V21H80V22H83V21H84V17M91 10V22H92V24H90V23H89V12H88V10H91M96 14H102V15H103V16H104V22H103V23H102V24H96V23H95V22H94V16H95V15H96V14M96 21H97V22H101V21H102V17H101V16H97V17H96V21M105 14H107V16H108V18H109V20H111V18H112V16H113V14H115V17H114V19H113V21H112V23H111V24H109V23H108V21H107V19H106V17H105V14M118 14H125V15H126V19H125V20H119V21H120V22H125V24H119V23H118V22H117V15H118V14M124 18V16H119V18H124M128 15H129V14H135V15H136V17H134V16H130V17H131V18H133V19H135V20H136V23H135V24H129V23H128V21H130V22H134V21H133V20H131V19H129V18H128V15M45 14H51V15H52V16H53V24H51V23H50V24H45V23H44V19H45V18H51V17H50V16H46V17H44V15H45V14M50 22V21H51V20H46V22H50Z" />
                  </svg>
                  <svg className="example-button-round" viewBox="0 0 146 36">
                    <g transform="translate(7,7)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <path fill="currentColor" d="M6 4H140V5H141V6H142V30H141V31H140V32H6V31H5V30H4V6H5V5H6V4M6 29H7V30H139V29H140V7H139V6H7V7H6V29M32 10H34V16H40V10H42V24H40V18H34V24H32V10M55 14H57V15H58V14H63V15H64V24H62V17H61V16H58V17H57V24H55V14M73 10H75V24H73V23H72V24H68V23H67V22H66V16H67V15H68V14H72V15H73V10M68 21H69V22H72V21H73V17H72V16H69V17H68V21M77 15H78V14H83V15H84V14H86V26H85V27H84V28H78V26H83V25H84V24H79V23H78V22H77V15M84 17H83V16H79V21H80V22H83V21H84V17M91 10V22H92V24H90V23H89V12H88V10H91M96 14H102V15H103V16H104V22H103V23H102V24H96V23H95V22H94V16H95V15H96V14M96 21H97V22H101V21H102V17H101V16H97V17H96V21M105 14H107V16H108V18H109V20H111V18H112V16H113V14H115V17H114V19H113V21H112V23H111V24H109V23H108V21H107V19H106V17H105V14M118 14H125V15H126V19H125V20H119V21H120V22H125V24H119V23H118V22H117V15H118V14M124 18V16H119V18H124M128 15H129V14H135V15H136V17H134V16H130V17H131V18H133V19H135V20H136V23H135V24H129V23H128V21H130V22H134V21H133V20H131V19H129V18H128V15M45 14H51V15H52V16H53V24H51V23H50V24H45V23H44V19H45V18H51V17H50V16H46V17H44V15H45V14M50 22V21H51V20H46V22H50Z" />
                  </svg>
                </div>
                <div>
                  <svg className="example-grid" viewBox="0 0 130 82">
                    <g transform="translate(6,6)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(30,6)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(54,6)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(78,6)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(102,6)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(6,30)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(30,30)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(54,30)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(78,30)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(102,30)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(6,54)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(30,54)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(54,54)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(78,54)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <g transform="translate(102,54)">
                      <path fill="currentColor" d={path} />
                    </g>
                    <path fill="#AAA" d="M4 4H8V6H6V8H4V4M26 4H32V6H30V8H28V6H26V4M50 4H56V6H54V8H52V6H50V4M74 4H80V6H78V8H76V6H74V4M4 78V74H6V76H8V78H4M98 4H104V6H102V8H100V6H98V4M32 78H26V76H28V74H30V76H32V78M56 78H50V76H52V74H54V76H56V78M80 78H74V76H76V74H78V76H80V78M104 78H98V76H100V74H102V76H104V78M126 78H122V76H124V74H126V78M126 4V8H124V6H122V4H126M126 50V56H124V54H122V52H124V50H126M126 26V32H124V30H122V28H124V26H126M4 32V26H6V28H8V30H6V32H4M4 56V50H6V52H8V54H6V56H4M28 32V30H26V28H28V26H30V28H32V30H30V32H28M52 32V30H50V28H52V26H54V28H56V30H54V32H52M76 32V30H74V28H76V26H78V28H80V30H78V32H76M100 32V30H98V28H100V26H102V28H104V30H102V32H100M28 56V54H26V52H28V50H30V52H32V54H30V56H28M52 56V54H50V52H52V50H54V52H56V54H54V56H52M76 56V54H74V52H76V50H78V52H80V54H78V56H76M100 56V54H98V52H100V50H102V52H104V54H102V56H100Z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3>Path Data</h3>
            <div className="flyout-padding">
              <textarea value={path} readOnly></textarea>
            </div>
          </div>
        </Flyout>
      )}
      {isFlyoutTemplateOpen && (
        <Flyout vertical={15}>
          <div className="flyout-templates">
            {
              templates.map((template, i) => (
                <button key={template.name} onClick={handleTemplate} data-template={i} title={template.name}>
                  <svg viewBox="0 0 48 48">
                    <path fill="currentColor" d={template.toolbarIcon} />
                  </svg>
                </button>
              ))
            }
          </div>
        </Flyout>
      )}
      <div className="logo">
        <svg viewBox="0 0 16 16">
          <path fill="currentColor" d="M13 1V2H14V3H15V13H14V14H13V15H3V14H2V13H1V3H2V2H3V1H13M3 12H4V13H12V12H13V4H12V3H4V4H3V12M5 5H8V8H11V11H8V8H5V5Z"></path>
        </svg>
      </div>
      <div className="toolbar-horizontal">
        <section>
          <button onClick={handleNew}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M15 38V37H14V11H15V10H28V12H30V14H32V16H34V37H33V38H15M17 13V35H31V22H25V21H24V13H17M31 17H29V15H27V19H31V17Z" />
            </svg>
          </button>
        </section>
        <section>
          <button onClick={handleProperties}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M14 10H34V11H35V25H34V26H14V25H13V11H14V10M16 13V23H18V21H20V19H22V17H24V19H26V21H28V19H30V17H32V13H16M13 29H16V32H13V29M13 35H16V38H13V35M18 35H35V38H18V35M18 29H35V32H18V29Z" />
            </svg>
          </button>
        </section>
        <section>
          <button onClick={handlePreview}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M8 22H10V19H12V17H15V15H19V13H29V15H33V17H36V19H38V22H40V26H38V29H36V31H33V33H29V35H19V33H15V31H12V29H10V26H8V22M32 28H35V25H37V23H35V20H32V18H28V16H20V18H16V20H13V23H11V25H13V28H16V30H20V32H28V30H32V28M21 22H22V21H26V22H27V26H26V27H22V26H21V22Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleImport}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M15 16V28H16V26H18V24H21V27H19V29H17V31H15V33H12V31H10V29H8V27H6V24H9V26H11V28H12V16H15M19 38V37H18V33H19V31H21V35H35V22H29V21H28V13H21V22H18V11H19V10H32V12H34V14H36V16H38V37H37V38H19M35 17H33V15H31V19H35V17Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleExport}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M24 27H36V26H34V24H32V21H35V23H37V25H39V27H41V30H39V32H37V34H35V36H32V33H34V31H36V30H24V27M11 38V37H10V11H11V10H24V12H26V14H28V16H30V25H27V22H21V21H20V13H13V35H27V32H30V37H29V38H11M27 17H25V15H23V19H27V17Z" />
            </svg>
          </button>
        </section>
        <section>
          <button onClick={handleDecreaseX} style={{ width: '1.5rem', borderRight: '1px solid #AAA' }}>
            <svg viewBox="0 0 24 48">
              <path fill="currentColor" d="M6 22H8V20H10V18H12V16H14V14H17V17H15V19H13V21H11V23H9V25H11V27H13V29H15V31H17V34H14V32H12V30H10V28H8V26H6V22Z" />
            </svg>
          </button>
          <div style={{ display: 'flex', flexDirection: "column" }}>
            <button onClick={handleDecreaseY} style={{ borderBottom: '1px solid #AAA' }}>
              <svg viewBox="0 0 48 24">
                <path fill="currentColor" d="M22 6V8H20V10H18V12H16V14H14V17H17V15H19V13H21V11H23V9H25V11H27V13H29V15H31V17H34V14H32V12H30V10H28V8H26V6H22Z" />
              </svg>
            </button>
            <button onClick={handleIncreaseY}>
              <svg viewBox="0 0 48 24">
                <path fill="currentColor" d="M26 18V16H28V14H30V12H32V10H34V7H31V9H29V11H27V13H25V15H23V13H21V11H19V9H17V7H14V10H16V12H18V14H20V16H22V18H26Z" />
              </svg>
            </button>
          </div>
          <button onClick={handleIncreaseX} style={{ width: '1.5rem', borderLeft: '1px solid #AAA' }}>
            <svg viewBox="0 0 24 48">
              <path fill="currentColor" d="M18 22H16V20H14V18H12V16H10V14H7V17H9V19H11V21H13V23H15V25H13V27H11V29H9V31H7V34H10V32H12V30H14V28H16V26H18V22Z" />
            </svg>
          </button>
        </section>
        <section>
          <label className="zoom">
            <input type="range" min={10} max={40} value={size} onInput={handleSizeChange} />
            <span>Zoom</span>
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
          <button onClick={handleMemory}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M10 14H11V13H24V14H25V17H37V18H38V35H37V36H11V35H10V14M13 33H35V20H22V16H13V33Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleUndo} disabled={hasUndo}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M12 18H14V16H16V14H18V12H21V15H19V17H17V18H30V20H33V22H35V25H37V30H35V33H33V35H30V37H21V34H29V32H32V29H34V26H32V23H29V21H17V22H19V24H21V27H18V25H16V23H14V21H12V18Z" />
            </svg>
          </button>
          <button onClick={handleRedo} disabled={hasRedo}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M37 18H35V16H33V14H31V12H28V15H30V17H32V18H19V20H16V22H14V25H12V30H14V33H16V35H19V37H28V34H20V32H17V29H15V26H17V23H20V21H32V22H30V24H28V27H31V25H33V23H35V21H37V18Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleInputModePixel}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M14 34V27H16V25H18V23H20V21H22V19H24V17H26V15H28V13H30V11H32V9H35V11H37V13H39V16H37V18H35V20H33V22H31V24H29V26H27V28H25V30H23V32H21V34H14M34 14V12H33V14H31V15H33V17H34V15H36V14H34M29 16V18H27V20H25V22H23V24H21V26H19V28H17V31H20V29H22V27H24V25H26V23H28V21H30V19H32V18H30V16H29M9 39V35H13V39H9Z" />
            </svg>
          </button>
          <button onClick={handleInputModeLine}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M26 22V26H22V22H26M31 22V26H27V22H31M36 17V21H32V17H36M21 22V26H17V22H21M16 27V31H12V27H16M11 27V31H7V27H11M41 17V21H37V17H41Z" />
            </svg>
          </button>
          <button onClick={handleInputModeRectangle}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M9 10H13V14H9V10M9 15H13V19H9V15M9 35H13V39H9V35M9 30H13V34H9V30M9 25H13V29H9V25M9 20H13V24H9V20M34 10H38V14H34V10M34 15H38V19H34V15M34 35H38V39H34V35M34 30H38V34H34V30M34 25H38V29H34V25M34 20H38V24H34V20M14 35H18V39H14V35M19 35H23V39H19V35M24 35H28V39H24V35M29 35H33V39H29V35M14 10H18V14H14V10M19 10H23V14H19V10M24 10H28V14H24V10M29 10H33V14H29V10Z" />
            </svg>
          </button>
          <button onClick={handleInputModeEllipse}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M22 7H26V11H22V7M22 37H26V41H22V37M7 22H11V26H7V22M37 22H41V26H37V22M7 17H11V21H7V17M12 12H16V16H12V12M17 7H21V11H17V7M31 7V11H27V7H31M36 12V16H32V12H36M41 17V21H37V17H41M12 32H16V36H12V32M17 37H21V41H17V37M27 37H31V41H27V37M7 27H11V31H7V27M37 27H41V31H37V27M32 32H36V36H32V32Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleTemplateOpen}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M12 12H24V24H36V36H24V24H12V12M8 9H9V8H13V10H10V13H8V9M10 38H13V40H9V39H8V35H10V38M8 25H10V28H8V25M10 33H8V30H10V33M8 20H10V23H8V20M8 15H10V18H8V15M38 38V35H40V39H39V40H35V38H38M38 25H40V28H38V25M40 33H38V30H40V33M38 20H40V23H38V20M38 15H40V18H38V15M38 10H35V8H39V9H40V13H38V10M25 40V38H28V40H25M33 38V40H30V38H33M20 40V38H23V40H20M15 40V38H18V40H15M25 10V8H28V10H25M33 8V10H30V8H33M20 10V8H23V10H20M15 10V8H18V10H15Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleRotateClockwise} disabled={noData}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M34 31H31V29H29V27H27V25H25V22H28V24H30V26H31V21H29V18H26V16H19V18H16V21H14V28H16V31H19V33H27V36H18V34H15V32H13V29H11V20H13V17H15V15H18V13H27V15H30V17H32V20H34V26H35V24H37V22H40V25H38V27H36V29H34V31Z" />
            </svg>
          </button>
          <button onClick={handleRotateCounterclockwise} disabled={noData}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M14 31H17V29H19V27H21V25H23V22H20V24H18V26H17V21H19V18H22V16H29V18H32V21H34V28H32V31H29V33H21V36H30V34H33V32H35V29H37V20H35V17H33V15H30V13H21V15H18V17H16V20H14V26H13V24H11V22H8V25H10V27H12V29H14V31Z" />
            </svg>
          </button>
          <div className="seperator"></div>
          <button onClick={handleFlipHorizontal} disabled={noData}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M23 39V33H25V39H23M23 31V25H25V31H23M23 15V9H25V15H23M23 23V17H25V23H23M21 36H20V37H8V36H7V28H9V23H11V18H13V12H14V11H20V12H21V36M12 30H10V34H18V14H16V20H14V25H12V30M27 36V12H28V11H34V12H35V18H37V23H39V28H41V36H40V37H28V36H27M36 30V25H34V20H32V14H30V34H38V30H36Z" />
            </svg>
          </button>
          <button onClick={handleFlipVertical} disabled={noData}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M9 23H15V25H9V23M17 23H23V25H17V23M33 23H39V25H33V23M25 23H31V25H25V23M12 21V20H11V8H12V7H20V9H25V11H30V13H36V14H37V20H36V21H12M18 12V10H14V18H34V16H28V14H23V12H18M12 27H36V28H37V34H36V35H30V37H25V39H20V41H12V40H11V28H12V27M18 36H23V34H28V32H34V30H14V38H18V36Z" />
            </svg>
          </button>
        </section>
      </div>
      <div className="editor">
        <Editor ref={editorRef}
          width={width}
          height={height}
          size={size}
          colors={colors}
          disableTransparency={disableTransparency}
          onChange={handleChange}
          onChangeData={handleChangeData}></Editor>
        <p className="warning">
          <svg><path d="M20 20H2V19H1V15H2V13H3V11H4V9H5V7H6V5H7V3H8V2H14V3H15V5H16V7H17V9H18V11H19V13H20V15H21V19H20V20M9 6H8V8H7V10H6V12H5V14H4V16H3V18H19V16H18V14H17V12H16V10H15V8H14V6H13V4H9V6M10 7H12V13H10V7M10 14H12V16H10V14Z"/></svg>
          UI work in progress, expect bugs!
        </p>
      </div>
    </div>
  );
}

export default App;
