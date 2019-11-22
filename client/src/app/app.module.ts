import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadSongComponent } from './music/upload-song.component';
import { SongListComponent } from './music/song-list.component';
import { AvailableSongsComponent } from './music/available-songs.component';
import { ListenSongComponent } from './music/listen-song.component';
import { MaterialModule } from './material.modules';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    UploadSongComponent,
    SongListComponent,
    AvailableSongsComponent,
    ListenSongComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
