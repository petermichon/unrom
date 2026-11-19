import type { ReactElement } from "react";

import { RomGlyph } from "@/components/RomMark";

/**
 * The Custom ROMs shortcuts are curated navigation and the hover panel mounts
 * on demand, so any mark referenced by URL paints after the tiles do. These
 * marks ship with the markup instead: vectors inline, and the two raster logos
 * as small silhouettes, so the first open is already complete.
 */
const CALYXOS_SILHOUETTE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAATNJREFUaN7tmUkSwyAMBOH/n845VQ6aRWObCpzlblAcLMQYZ+wx5tVIsvs0Fd6WYALHARtkBW5QFYRBVDAGTbGb4SqSMkxiru2G37EthmVsg6GItQVltGkAoj0DEu0YsGhdgIbLBjhcFBDxmoGJVwTcA4KBfIAW0FOKC8icMu+QZODxZMkn4Lk3W+ITiRX5eGpVPmyQ+egWqfPB/Dp8JMHWApAMuPzS4AuKkqdFsHCMJr6UwSM4gg0EnEH4o71mq1gjpmsoAZ5gTksQ/2TmP/pm2QKvUuTfVDo+X/za5Xv8APKOI5Q0I3bB8jE2fxCPtxLyzZB4OyffkIq31PJNwXxbM96YXZxRmvj55ni+vX/DBcUXi9xKUD7z8zfh/4ov4OOXpWF8/sI6S4cUFryw9LDPiI8PsdoUGqpui2MAAAAASUVORK5CYII=";
const EOS_SILHOUETTE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAS1JREFUaN7t2UEOwjAMRNH4/pdGXYKIM54Zt2nVrOv/lEIDgjHQFd8LniPaZiTS1VuXDSQvEGieJCp5gqjmqwTTLwhcHif4PiYofUTQ+mtB7a8EvZ8Ljn4mePpzwdWfCfAgKRRH6oJ3y6WrqXcFfin74IAXjuXCJvk+OCv0oWGpj4xr/fW82l8W5P4iYejnEUc/rXQDnn7SuQJg+tOQawPTkq0/S20FRHn9HfLljxa8ASZ/xLYByD4MsP1AX+MXeAEdoJ+z7get+ywqndZcv/W4no4NC5EMDeu6Ani3sMM9utkW4v5CXCM8YAtOIu4vRHQT0U5ENxHRTcRy9QsqtJHg/DHgsXeJBvYReAAUBKD9r3z+jyYroQJnHK/9HxEJYeqPU765/jHM/V+kNPcBwFsQxQ/EU1IAAAAASUVORK5CYII=";

const MARKS = new Set(["calyxos", "eos", "grapheneos", "iode", "lineageos"]);

export function hasRomMenuMark(id: string): boolean {
  return MARKS.has(id);
}

export function RomMenuMark({ id }: { id: string }): ReactElement | null {
  switch (id) {
    case "grapheneos":
      return (
        <svg
          aria-hidden="true"
          data-rom-glyph={id}
          viewBox="0 0 2644.0798 2644"
          className="size-5"
        >
          <path
            fill="currentColor"
            fillRule="nonzero"
            d="m771.67168 798 381.00032-217c-7.0001-21-12.0001-43-12.0001-67 0-92 67.0001-168 155.0001-184v-330h64v330c88 16 155 92 155 184 0 24-5 46-13 67l382 217c14-16 31-30 50-42 80-46 180-26 237 42l286-165 32 56-286 165c31 84-2 180-82 226-18 10-36 17-55 21v442c19 4 37 11 55 21 80 46 113 142 82 226l286 165-32 56-286-165c-57 68-157 88-237 42-19-12-36-26-50-42-127 72-254 145-382 217 8 21 13 43 13 67 0 92-67 168-155 184v330h-64v-330c-88-16-155.0001-92-155.0001-184 0-24 5-46 12.0001-67l-381.00032-217c-14 16-31 30-50 42-80 46-180 26-237-42l-285.99999 165-32-56 285.99999-165c-31-84 2-180 82-226 18-10 36-17 55-21v-442c-19-4-37-11-55-21-80-46-113-142-82-226l-285.99999-165 32-56 285.99999 165c57-68 157-88 237-42 19 12 36 26 50 42zm1080.00032 992c-18-50-15-108 14-157 30-52 81-84 136-92v-438c-55-8-106-40-136-92-29-49-32-107-14-157l-382-218c-35 40-85 65-142 65s-107-25-142-65l-382.00032 218c18 50 15 108-14 157-30 52-81 84-136 92v438c55 8 106 40 136 92 29 49 32 107 14 157l382.00032 218c35-40 85-65 142-65s107 25 142 65z"
          />
        </svg>
      );
    case "lineageos":
      return (
        <svg
          aria-hidden="true"
          data-rom-glyph={id}
          viewBox="-3 -1.2 45.9 18.6"
          className="h-3 w-7"
        >
          <path
            fill="currentColor"
            d="M36,8.2c-1.1,0-2.2,0.5-3,1.3l-0.2-0.1C31.2,8.8,29.6,8.3,28,8l0,0c0-4.4-3.6-8-8-8s-8,3.6-8,8h-0.2 c-1.6,0.3-3.1,0.8-4.6,1.4L7,9.5C5.5,7.8,3,7.7,1.3,9.2c-1.6,1.5-1.8,4-0.3,5.6s4,1.8,5.6,0.3c1.1-1,1.5-2.5,1.2-3.9l0,0 c1.4-0.5,2.8-1,4.3-1.3c1,4.3,5.3,7,9.6,5.9c2.9-0.7,5.2-3,5.9-5.9c1.5,0.3,2.9,0.7,4.3,1.3l0,0c-0.5,2.1,0.8,4.3,2.9,4.8 c2.1,0.5,4.3-0.8,4.8-2.9S39,8.8,36.9,8.3C36.6,8.2,36.3,8.2,36,8.2z M4,14.2c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S5.1,14.2,4,14.2 z M20,14.2c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S23.3,14.2,20,14.2z M36,14.2c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S37.1,14.2,36,14.2z M23,8.2c0,1.7-1.3,3-3,3c-1.7,0-3-1.3-3-3s1.3-3,3-3C21.7,5.2,23,6.5,23,8.2z"
          />
        </svg>
      );
    case "iode":
      return (
        <svg
          aria-hidden="true"
          data-rom-glyph={id}
          viewBox="15 31.5 480.5 431.5"
          className="size-5"
        >
          <circle cx="49" cy="65.5" r="34" fill="currentColor" />
          <rect
            x="23"
            y="155"
            width="52"
            height="305"
            rx="26"
            fill="currentColor"
          />
          <circle
            cx="340"
            cy="307.5"
            r="129.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="52"
          />
        </svg>
      );
    case "calyxos":
      return <RomGlyph id={id} src={CALYXOS_SILHOUETTE} className="size-5" />;
    case "eos":
      return <RomGlyph id={id} src={EOS_SILHOUETTE} className="size-5" />;
    default:
      return null;
  }
}
