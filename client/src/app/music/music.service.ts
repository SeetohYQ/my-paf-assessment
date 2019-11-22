import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Music } from './models';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  user = 'fred';

  constructor(private http: HttpClient) { }

  getUser() {
    return this.user;
  }

  uploadSong(newSong: FormData) {
    console.log(newSong);
    this.http.post('http://localhost:3000/api/upload-song', newSong).toPromise()
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      })
  }

  getList() : Promise<Music[]> {
    return this.http.get<Music[]>('http://localhost:3000/api/songs').toPromise();
  }

  getSong(musicId: string) : Promise<Music> {
    return this.http.get<Music>(`http://localhost:3000/api/songs/${musicId}`).toPromise();
  }

  releaseSlot(music: Music) {
    const params = new HttpParams()
          .set('user', this.getUser());
    this.http.put(`http://localhost:3000/api/songs/${music.music_id}`, music, {params}).toPromise()
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      })
  }

  addListener(music: Music) {
    const params = new HttpParams()
              .set('user', 'barney');
    this.http.post('http://localhost:3000/api/songs', music, {params}).toPromise()
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      })
  }
}
