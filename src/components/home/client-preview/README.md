# Client preview

`ClientPreview` is a responsive HTML/CSS recreation of the current desktop dashboard. It composes the window frame and navigation with reusable metric, sparkline, proxy status, core status, and proxy mode cards. The bottom row uses the current screenshot proportions: 3/5/4 columns for proxy, core, and mode. The upstream dashboard's current default widget set omits Proxy Mode and gives Core Status four columns; this preview follows the current screenshot layout.

```tsx
<ClientPreview labels={labels} icons={icons} metrics={metrics} core={core} />
```

The parent supplies localized labels and Iconify `{ body, viewBox }` data. `metrics` and `core` use the exported `MetricPreviewData` and `CorePreviewData` types. `DEMO_METRICS` and `DEMO_CORE_PREVIEW_DATA` are independently exported defaults; the default values and chart series match the current widget preview fixtures. Proxy toggles and mode selection only change local preview state; they do not call the desktop application.

## Source references

- `frontend/nyanpasu/src/components/widgets/widget-shortcut.tsx` — Proxy Status, Core Status, current core card, and status behavior
- `frontend/nyanpasu/src/components/widgets/widget-sparkline.tsx` and `frontend/ui/src/sparkline.tsx` — metric cards and sparkline presentation
- `frontend/nyanpasu/src/components/widgets/widget-ui.tsx` and `frontend/ui/src/card.tsx` — shared card/title geometry and tokens
- `frontend/nyanpasu/src/components/widgets/consts.ts` — widget sizes and default dashboard layout
- `frontend/nyanpasu/src/components/widgets/widget-config.ts` — per-widget defaults
- `frontend/nyanpasu/src/components/settings/system-proxy.tsx` and `frontend/ui/src/shape-toggle.tsx` — reusable proxy toggles
- `frontend/nyanpasu/src/components/widgets/widget-proxy-mode.tsx` — proxy mode control layout and choices

The adapted `source-sparkline.tsx` retains the upstream GPL-3.0 license (see `LICENSE.clash-nyanpasu`). It preserves buffered scrolling, edge guards and independent vertical rescaling; `sparkline.tsx` provides the injectable preview data adapter.

`WindowFrame`, `Dashboard`, `MetricCard`, `Sparkline`, `ProxyStatus`, `CoreStatus`, and `ProxyMode` are also exported individually. Proxy controls accept explicit values and change callbacks, so animations can drive them without depending on the preview state hook.
