import avatar1 from "@assets/avatar_female_woman_person_people_white_tone_icon_159360_1782318102064.png";
import avatar2 from "@assets/1993889-belle-femme-latine-avatar-icone-personnage-gratuit-vec_1782318102114.jpg";
import avatar3 from "@assets/images_(38)_1782318102140.jpeg";

const DEFAULT_AVATARS = [avatar1, avatar2, avatar3];

export function getUserAvatar(userId: number, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  return DEFAULT_AVATARS[userId % DEFAULT_AVATARS.length];
}
