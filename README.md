# tournament_overlay
ビーセイ大会用オーバーレイです。

![image](https://github.com/user-attachments/assets/e57d884f-9e67-48d7-b0f4-35f55c124971)

# 主な特徴
- 曲時間、スコア、精度、コンボ数、ミス数、Fail表示のみのシンプルで見やすい表示です (曲名などの譜面情報は主催者側で用意)
- プレイ終了後も非表示しないため、結果の確認が容易です
- Fail後もスコアが50%にならず、Fail有無同士でもスコア比較が可能です
- NFを付けずにプレイ開始した場合に **No NF!** と表示します。また、Failしたときに **Failed** と表示します
- 両側に譜面スタート時のタイミング取得用の■マークが表示されます

    （左：スタート～ポーズ解除まで表示　　右：スタート～曲時間1秒まで表示）

![image](https://github.com/user-attachments/assets/606d591a-ff6a-4775-95d1-f52793e22fe9)

# 使用方法

[HttpSiraStatus](https://github.com/denpadokei/beatsaber-http-status)を使用して、下記URLをOBS等の配信ツールにブラウザソースとして設定して使用可能です。

[**詳しいインストール方法**](https://github.com/rynan4818/tournament_overlay#%E5%88%9D%E3%82%81%E3%81%A6%E3%81%AE%E6%96%B9%E5%90%91%E3%81%91%E3%81%AE%E8%A9%B3%E3%81%97%E3%81%84%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E6%96%B9%E6%B3%95)

※以下の配信ツールで動作確認済みです
- OBS Studio
- Streamlabs Desktop
- XSplit Broadcaster
- Twitch Studio Beta

※プログラム修正時に自動反映させるため、ダウンロードせずに下記URLでお使い下さい。

※表示位置は上部固定になっています。特にタイミングマークを利用して対戦者の配信ズレを補正する場合は、位置が重要になるためデフォルトの位置で利用をお願いします。詳しくは主催者に確認して下さい。

## 大会用オーバーレイ表示用URL(スケール自動調整：通常はこちらを使用)
```
https://rynan4818.github.io/tournament_overlay/
```

※スケールを自動調整するため、**OBSのブラウザソースの設定でオーバーレイのブラウザの幅を配信する解像度に合わせて下さい**。

![image](https://github.com/user-attachments/assets/2e457e5c-2ade-4b3e-89f5-0f47c642b15e)

### 1080p(1920x1080)用 (1.5倍スケール固定)※従来の互換用
```
https://rynan4818.github.io/tournament_overlay/?modifiers=scale
```

## シーンコントロール使用時の注意点
[obs-control](https://github.com/rynan4818/obs-control)等でOBSのシーンコントロールを使用している場合は、メニュー用シーンとゲームプレイ用シーンの両方に大会用オーバーレイの追加をお願いします。（ゲームプレイ用シーンのみだと、プレイ終了時に消えてしまうため）

その際に、追加するブラウザソースは「**既存を追加**」で追加して下さい。（**新規作成で追加しない**)

![image](https://github.com/rynan4818/tournament_overlay/assets/14249877/102897af-62dd-4a7a-9ece-014f18656097)

また、シーン切り替えで使用するBeatSaberのオーバーレイは全てで「表示されていないときにソースをシャットダウンする」と「シーンがアクティブになったときにブラウザの表示を更新する」のチェックを外して下さい。

![image](https://github.com/rynan4818/tournament_overlay/assets/14249877/3bd9ddb9-aadb-4548-b396-84b4188e50e1)

また、[TournamentAssistant](https://github.com/MatrikMoon/TournamentAssistant)を使用する場合は、プレイ開始時のシーン切替にトランジション動画を入れると、TournamentAssistantの機能（QRコード表示で配信の同期を取る）に影響が出るため、トランジションを外すなど対応をお願いします。詳しくは大会主催者に確認して下さい。

よくわからない場合は、大会での参加ではシーン切り替えを使わないことをおすすめします。

## 初めての方向けの詳しいインストール方法

1. HttpSiraStatus のインストール

    Beat Saberからオーバーレイにデータを送信するためにHttpSiraStatusをインストールしてください。

    **BeatSaber1.29.1環境の場合は、HttpSiraStatus-9.＊.＊バージョンを使用してください。**

   - [HttpSiraStatus](https://github.com/denpadokei/HttpSiraStatus/releases)
   
       上記からダウンロードして解凍した`HttpSiraStatus.dll`をBeatSaberのインストールフォルダの`Plugins`フォルダにコピーします。
       
       ダウンロードするzipファイル名の`bs*.**.**`の部分が自分の使用しているBeatSaberのバージョンと**同じ**か、**小さくて一番新しい**ものを使用してください。

       `bs*.**.**`のバージョンが使用するBeatSaberのバージョンよりも**大きいと動作しません**ので注意してください

       **[HttpSiraStatus推奨バージョン](https://github.com/rynan4818/tournament_overlay/wiki/HttpSiraStatus%E4%BD%BF%E7%94%A8%E6%8E%A8%E5%A5%A8%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3-%5B2025%E5%B9%B45%E6%9C%8817%E6%97%A5%E6%99%82%E7%82%B9%5D)**
   
       HttpSiraStatusを使用する際に、以前は[websocket-sharp](https://beatmods.com/mods/155)のインストールも必須でしたが、上記の2025/5/17時点での推奨バージョンではインストール不要となっています。

       もし動作しない場合は、上記推奨バージョンにアップデートしてください。

1. OBSのソースにブラウザを追加します。

    ![image](https://github.com/user-attachments/assets/bf702101-d85e-4891-9959-7095d766bc91)

2. 新規作成を選択して、適当にソースの名前を設定して、OKを押します。

   ![image](https://github.com/user-attachments/assets/c5b4d538-5d6a-4279-9f6a-4d165c036896)

3. 大会用オーバーレイ表示用URL `https://rynan4818.github.io/tournament_overlay/` を、OBSのURL欄に貼り付けます。
   ```
   https://rynan4818.github.io/tournament_overlay/
   ```
   また、画面サイズに合わせて幅・高さを設定します。(1920x1080等)

   幅に合わせてオーバーレイの表示倍率が自動的に調整されます。

   ![image](https://github.com/user-attachments/assets/dd63d4b5-b61e-4d72-a354-a8545339d1f8)

4. オーバーレイのソースの順序を一番上にして、オーバーレイが常に表示されるようにします。

    ![image](https://github.com/user-attachments/assets/28573408-efc1-4061-bdf5-8734a07ba65a)

5. OBSの画面の四隅に赤色の■が見えるか確認します。（ビートセイバーが起動すると■が消えます）

    ![image](https://github.com/user-attachments/assets/21a53d33-e448-495f-a1f6-930e4ae6bc81)

    四隅に■が見えない場合は、表示が移動されているか解像度が合っていませんので見直すか、一旦削除してNo.2(OBSのソースにブラウザ追加)からやり直してください。
   

## 動作しない場合
もしも動作しない場合は、Beat Saber Overlay 改良版の[トラブルシューティング](https://github.com/rynan4818/beat-saber-overlay/blob/master/Troubleshooting.md)を参照してください。

## 備考
* index.html, bsdp-like_d.html, bsdp-like.css は[BSDP-Overlay](https://github.com/kOFReadie/BSDP-Overlay)を元に改造しています。

* QRコード表示ライブラリとして、[libqrean](https://github.com/kikuchan/libqrean)の[Wasmデモ](https://kikuchan.github.io/libqrean/wasm/)の[Qrean.js](https://github.com/kikuchan/libqrean/blob/main/dist/Qrean.js)と[index.html](https://github.com/kikuchan/libqrean/blob/main/wasm/index.html)を流用・参考にさせて頂きました。ライセンスは[MIT License](https://github.com/kikuchan/libqrean/blob/main/LICENSE)です
