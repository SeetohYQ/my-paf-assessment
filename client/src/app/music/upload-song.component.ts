import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MusicService } from './music.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-song',
  templateUrl: './upload-song.component.html',
  styleUrls: ['./upload-song.component.css']
})
export class UploadSongComponent implements OnInit {

  uploadForm: FormGroup;
  countries = ['Singapore', 'Japan', 'Russia', 'Malaysia', 'United Kingdom', 'United States'];
  slots = [1, 2, 3, 4, 5];
  file: File = null;

  constructor(private musicSvc: MusicService, private router: Router) { }

  ngOnInit() {
    this.uploadForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'country': new FormControl(this.countries[0], Validators.required),
      'listenSlots': new FormControl(this.slots[2], Validators.required),
      'lyrics': new FormControl(),
      'mp3File': new FormControl('', Validators.required)
    })

  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.uploadForm.get('title').value);
    formData.append('country', this.uploadForm.get('country').value);
    formData.append('listenSlots', this.uploadForm.get('listenSlots').value);
    formData.append('lyrics', this.uploadForm.get('lyrics').value);
    formData.append('mp3File', this.file);
    this.musicSvc.uploadSong(formData);
    this.router.navigate(['/list']);
  }

  newFile(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
    }
  }
}
