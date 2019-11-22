import { Component, OnInit } from '@angular/core';
import { MusicService } from './music.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Music } from './models';

@Component({
  selector: 'app-listen-song',
  templateUrl: './listen-song.component.html',
  styleUrls: ['./listen-song.component.css']
})
export class ListenSongComponent implements OnInit {

  songId: string;
  music: Music;

  constructor(private musicSvc: MusicService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.songId = this.route.snapshot.params.id;
    this.musicSvc.getSong(this.songId)
      .then(result => {
        this.music = result;
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      })
  }

  return() {
    this.router.navigate(['/songs']);
  }
}
