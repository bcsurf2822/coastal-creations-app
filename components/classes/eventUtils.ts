import {
  FaPalette,
  FaGraduationCap,
  FaTree,
} from "react-icons/fa";
import {
  GiPaintBrush,
  GiPaintRoller,
  GiMagicHat,
  GiCampfire,
  GiForest,
  GiButterfly,
  GiPalette,
} from "react-icons/gi";
import { IconType } from "react-icons";

// Icon pools for different event types
const classIcons = [FaPalette, GiPaintBrush, GiPaintRoller, FaGraduationCap, GiMagicHat];
const campIcons = [GiCampfire, GiForest, GiButterfly, FaTree];
const artistIcons = [FaPalette, GiPaintBrush, GiPaintRoller, GiPalette, GiMagicHat];

export const getRandomIcon = (index: number, eventType?: string): IconType => {
  const type = eventType?.toLowerCase();

  if (type === "camp") {
    return campIcons[index % campIcons.length];
  } else if (type === "artist") {
    return artistIcons[index % artistIcons.length];
  } else {
    return classIcons[index % classIcons.length];
  }
};
