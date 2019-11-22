export interface Music {
    music_id?: string;
    music_url?: string;
    song_title: string;
    country: string;
    listening_slots: number;
    lyrics?: string;
    checked_out?: number;
    playTimes?: number;
}