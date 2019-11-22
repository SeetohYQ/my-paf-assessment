import { Component, OnInit } from '@angular/core';
import { Music } from './models';
import { MusicService } from './music.service';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.css']
})
export class SongListComponent implements OnInit {

  musicList: Music[];
  constructor(private musicSvc: MusicService) { }

  ngOnInit() {
    this.musicSvc.getList()
      .then(result => {
        this.musicList = result;
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      })
  }

}
