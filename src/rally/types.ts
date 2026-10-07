export interface Mission {
  id: string;
  title: string;
  detail?: string;
  points: number;
  isMust: boolean; // 必ず1つだけ
  isActive: boolean; // false のあいだは参加者に表示しない
  order: number;
}

export interface Team {
  id: string;
  teamName: string;
  photos: Record<string, string>; // ミッションID -> 写真URL
  updatedAt: number;
}

// Cloudinaryに小さい正方形の画像を作ってもらう（一覧を速く表示するため）
export function thumb(url: string, size = 300): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/c_fill,w_${size},h_${size}/`) : url;
}

export function sortForPlay(missions: Mission[]): Mission[] {
  return missions.filter((m) => m.isActive).sort((a, b) => Number(b.isMust) - Number(a.isMust) || a.order - b.order);
}
