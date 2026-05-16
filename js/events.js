const START_RESUME_GUARD_MS = 2000;
var song_start_event_time = null;

const events = {
  hello(data) {
    console.log("Connected to Beat Saber");
    ui.check_mark_hidden_set();

    menu_shine = true;
    song_start_event_time = null;
    if (data.status.beatmap && data.status.performance) {
      ui.beatmap(data);
      ui.performance(data);
      ui.start_hidden_set();
      ui.show();
    }
    if (typeof op_hello !== "undefined") op_hello(data);
  },

  songStart(data) {
    song_start_event_time = (typeof data.time === "number") ? data.time : null;
    ui.beatmap(data);
    ui.performance(data);
    ui.start_hidden_set();
    ui.show();
    if (typeof op_songStart !== "undefined") op_songStart(data);
  },

  noteCut(data) {
    ui.performance(data);
    if (typeof op_noteCut !== "undefined") op_noteCut(data);
  },

  noteFullyCut(data) {
    ui.performance(data);
    if (typeof op_noteFullyCut !== "undefined") op_noteFullyCut(data);
  },

  obstacleEnter(data) {
    ui.performance(data);
    if (typeof op_obstacleEnter !== "undefined") op_obstacleEnter(data);
  },

  obstacleExit(data) {
    ui.performance(data);
    if (typeof op_obstacleExit !== "undefined") op_obstacleExit(data);
  },

  noteMissed(data) {
    ui.performance(data);
    if (typeof op_noteMissed !== "undefined") op_noteMissed(data);
  },

  bombCut(data) {
    ui.performance(data);
    if (typeof op_bombCut !== "undefined") op_bombCut(data);
  },

  finished(data) {
    ui.performance(data);
    if (typeof op_finished !== "undefined") op_finished(data);
  },

  failed(data) {
    ui.performance(data);
    if (typeof op_failed !== "undefined") op_failed(data);
  },

  softFailed(data) {
    ui.performance(data);
  },

  scoreChanged(data) {
    ui.performance(data);
    if (typeof op_scoreChanged !== "undefined") op_scoreChanged(data);
  },

  energyChanged(data) {
    ui.performance(data);
    if (typeof op_energyChanged !== "undefined") op_energyChanged(data);
  },

  noteSpawned(data) {
  },

  other(data) {
    if (typeof data.other !== "undefined") {
      if (typeof data.other.HttpPlayButtonStatus !== "undefined") {
        if (typeof data.other.HttpPlayButtonStatus.OptionScene === "undefined") {
          if (typeof data.other.HttpPlayButtonStatus.SceneChange !== "undefined") obs_scene_change_enable = data.other.HttpPlayButtonStatus.SceneChange;
          if (typeof data.other.HttpPlayButtonStatus.PlayStart !== "undefined" && data.other.HttpPlayButtonStatus.PlayStart) {
            ui.start_hidden_set();
          }
        }
      }
    }
  },

  beatmapEvent(data) {
    if (typeof data.status !== "undefined") {
      if (typeof data.status.performance !== "undefined") {
        var song_time = data.status.performance.currentSongTime;
        if (typeof song_time !== "undefined") {
          ui.timer.song_time_update(song_time);
          if (song_time >= 1) {
            ui.start_hidden_release1();
            ui.start_hidden_release2();
          }
        }
      }
    }
  },


  pause(data) {
    var ip = query.get("ip");
    var diff_time = 0;
    if (ip && ip != "localhost" && ip != "127.0.0.1") {
      diff_time = Date.now() - data.time;
      console.log(diff_time);
    }
    ui.timer.pause(data.status.beatmap.paused + diff_time);
    if (typeof op_pause !== "undefined") op_pause(data);
  },

  resume(data) {
    var allow_release_left_mark = true;
    if (typeof data.time === "number" && typeof song_start_event_time === "number") {
      allow_release_left_mark = (data.time - song_start_event_time) >= START_RESUME_GUARD_MS;
    }
    if (allow_release_left_mark) {
      ui.start_hidden_release1();
    }
    var ip = query.get("ip");
    var diff_time = 0;
    if (ip && ip != "localhost" && ip != "127.0.0.1") {
      diff_time = Date.now() - data.time;
      console.log(diff_time);
    }
    ui.timer.start(data.status.beatmap.start + diff_time, data.status.beatmap.length, false);
    if (typeof op_resume !== "undefined") op_resume(data);
  },

  menu(data) {
    menu_shine = true;
    song_start_event_time = null;
    ui.start_hidden_release1();
    ui.start_hidden_release2();
    ui.timer.stop();
    if (disp_hidden) {
      ui.hide();
    }
    if (typeof op_menu !== "undefined") op_menu(data);
  }
}