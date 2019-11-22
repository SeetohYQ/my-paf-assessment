import { Component, OnInit } from '@angular/core';
import { Music } from './models';
import { MusicService } from './music.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-available-songs',
  templateUrl: './available-songs.component.html',
  styleUrls: ['./available-songs.component.css']
})
export class AvailableSongsComponent implements OnInit {
  musicList: Music[];
  user: string;

  constructor(private musicSvc: MusicService, private router: Router) { }

  ngOnInit() {
    this.user = this.musicSvc.getUser();

    this.musicSvc.getList()
      .then(result => {
        this.musicList = result;
      })
      .catch(error => {
        console.log(error);
      })
  }

  checkOut(index: number) {
    this.musicSvc.addListener(this.musicList[index]);
    this.router.navigate(['/song', this.musicList[index].music_id]);
  }
}
