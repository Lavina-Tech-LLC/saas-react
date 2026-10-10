import { Badge, Box, Group, Slider, Stack } from '@mantine/core';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent } from 'react';

import { useT } from '../../context';
import { CANVAS_SIZE, drawPreview, exportCrop, type CropState } from './cropCanvas';

export type AvatarCropperHandle = { crop: () => Promise<Blob | null> };

/** Drag to position, slide to zoom; `crop()` returns the circular PNG. */
export const AvatarCropper = forwardRef<AvatarCropperHandle, { file: File }>(function AvatarCropper({ file }, ref) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; ratio: number } | null>(null);
  const [state, setState] = useState<CropState>({ zoom: 1, offset: { x: 0, y: 0 } });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      imgRef.current = img;
      setState({ zoom: 1, offset: { x: 0, y: 0 } });
      setLoaded(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (loaded && ctx && imgRef.current) drawPreview(ctx, imgRef.current, state);
  }, [state, loaded]);

  useImperativeHandle(
    ref,
    () => ({ crop: () => (imgRef.current ? exportCrop(imgRef.current, state) : Promise.resolve(null)) }),
    [state],
  );

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    // Pointer moves are in CSS pixels; the canvas may be displayed smaller than its 320px drawing size
    const ratio = CANVAS_SIZE / e.currentTarget.getBoundingClientRect().width;
    drag.current = { x: e.clientX, y: e.clientY, ox: state.offset.x, oy: state.offset.y, ratio };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    setState((s) => ({
      ...s,
      offset: { x: d.ox + (e.clientX - d.x) * d.ratio, y: d.oy + (e.clientY - d.y) * d.ratio },
    }));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <Stack align="center" gap="md">
      <Box
        pos="relative"
        w="100%"
        maw={CANVAS_SIZE}
        bdrs="md"
        bg="var(--mantine-color-default-hover)"
        style={{ aspectRatio: '1', overflow: 'hidden' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ width: '100%', height: '100%', cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
        <Badge pos="absolute" bottom={8} right={8} size="sm" variant="default">
          {t('avatar.size')}
        </Badge>
      </Box>
      <Group w="100%" maw={280} gap="xs" wrap="nowrap">
        <ZoomOut size={16} />
        <Slider
          flex={1}
          min={1}
          max={3}
          step={0.01}
          value={state.zoom}
          onChange={(zoom) => setState((s) => ({ ...s, zoom }))}
          label={null}
          aria-label={t('avatar.zoom')}
        />
        <ZoomIn size={16} />
      </Group>
    </Stack>
  );
});
