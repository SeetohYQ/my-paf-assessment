import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadSongComponent } from './music/upload-song.component';
import { AvailableSongsComponent } from './music/available-songs.component';
import { SongListComponent } from './music/song-list.component';
import { ListenSongComponent } from './music/listen-song.component';


const routes: Routes = [
  { path: '', component: SongListComponent },
  { path: 'list', component: SongListComponent },
  { path: 'list/upload', component: UploadSongComponent },
  { path: 'songs', component: AvailableSongsComponent },
  { path: 'song/:id', component: ListenSongComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
