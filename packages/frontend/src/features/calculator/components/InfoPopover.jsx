import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const OPEN_POPOVER_EVENT = 'pnccalc:open-info-popover';

export default function InfoPopover({ trigger, label, children, triggerClassName = '' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12, width: 340 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimerRef = useRef(null);
  const popoverId = useId();

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const openPopover = useCallback(() => {
    cancelClose();
    document.dispatchEvent(new CustomEvent(OPEN_POPOVER_EVENT, {
      detail: { popoverId },
    }));
    setOpen(true);
  }, [cancelClose, popoverId]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 120);
  }, [cancelClose]);

  const updatePosition = useCallback(() => {
    const triggerBounds = triggerRef.current?.getBoundingClientRect();
    if (!triggerBounds) return;

    const gutter = 12;
    const gap = 8;
    const width = Math.min(360, window.innerWidth - gutter * 2);
    const measuredHeight = popoverRef.current?.offsetHeight ?? 280;
    const centeredLeft = triggerBounds.left + triggerBounds.width / 2 - width / 2;
    const left = Math.min(
      window.innerWidth - width - gutter,
      Math.max(gutter, centeredLeft),
    );
    const below = triggerBounds.bottom + gap;
    const above = triggerBounds.top - measuredHeight - gap;
    const top = below + measuredHeight <= window.innerHeight - gutter || above < gutter
      ? below
      : above;

    setPosition({ left, top: Math.max(gutter, top), width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const onAnotherPopoverOpen = (event) => {
      if (event.detail?.popoverId !== popoverId) setOpen(false);
    };
    document.addEventListener(OPEN_POPOVER_EVENT, onAnotherPopoverOpen);
    return () => document.removeEventListener(OPEN_POPOVER_EVENT, onAnotherPopoverOpen);
  }, [popoverId]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (
        !triggerRef.current?.contains(event.target)
        && !popoverRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return (
    <span
      className="info-popover-anchor"
      onMouseEnter={() => {
        openPopover();
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`info-popover-trigger ${triggerClassName}`.trim()}
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={openPopover}
        onFocus={openPopover}
      >
        {trigger}
      </button>
      {open && createPortal(
        <section
          ref={popoverRef}
          id={popoverId}
          className="info-popover"
          role="tooltip"
          style={position}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {children}
        </section>,
        document.body,
      )}
    </span>
  );
}
