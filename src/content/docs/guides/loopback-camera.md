---
title: Loopback Camera Setup
description: Expose mosoptics pipeline output as a system camera for Google Meet, Zoom, and other video apps.
---

A **loopback camera** makes your mosoptics pipeline output appear as a
real webcam in any video app: Google Meet, Zoom, Teams, OBS, Discord,
or anything that uses system cameras.

:::note
In mosoptics, "virtual camera" means a video file playing back as a
camera source. "Loopback camera" means piping pipeline output to a
system device that other apps can see.
:::

## Linux Setup

Linux uses the **v4l2loopback** kernel module to create system-level
virtual video devices. Mosoptics writes YUYV frames directly to the
device via kernel ioctls, with no extra software required.

### Step 1: Install v4l2loopback

```bash
sudo apt install v4l2loopback-dkms v4l2-utils
```

### Step 2: Create a loopback device

```bash
sudo modprobe v4l2loopback \
  devices=1 \
  video_nr=10 \
  card_label="mosoptics" \
  exclusive_caps=1
```

| Parameter | Purpose |
|-----------|---------|
| `devices=1` | Number of loopback devices to create |
| `video_nr=10` | Device number (creates `/dev/video10`) |
| `card_label="mosoptics"` | Name shown in app camera selectors |
| `exclusive_caps=1` | Required for Chrome/WebRTC to recognize the device |

### Step 3: Verify the device exists

```bash
v4l2-ctl --list-devices
```

You should see `mosoptics` (or your label) in the output with
`/dev/video10`.

### Step 4: Run a pipeline with loopback output

```bash
# Single camera feed to loopback
mosoptics-cli run my-pipeline --loopback /dev/video10

# Dual camera, left eye to loopback
mosoptics-cli run my-dual-pipeline --loopback /dev/video10 --loopback-side left

# Dual camera, both eyes to separate loopback devices
mosoptics-cli run my-dual-pipeline \
  --loopback-left /dev/video10 \
  --loopback-right /dev/video11
```

### Step 5: Select the camera in your video app

Open Google Meet, Zoom, or any video app. In the camera settings,
select **mosoptics** from the camera list. You should see the live
pipeline output.

### Creating two loopback devices (for stereo)

To expose both eyes of a stereo/dual pipeline as separate cameras:

```bash
sudo modprobe v4l2loopback \
  devices=2 \
  video_nr=10,11 \
  card_label="mosoptics-left","mosoptics-right" \
  exclusive_caps=1
```

Then run with:

```bash
mosoptics-cli run tadpole-dual \
  --loopback-left /dev/video10 \
  --loopback-right /dev/video11
```

### Auto-load at boot

To make the loopback device persist across reboots:

```bash
# Load the module at boot
echo "v4l2loopback" | sudo tee /etc/modules-load.d/v4l2loopback.conf

# Configure module parameters
echo 'options v4l2loopback devices=2 video_nr=10,11 card_label="mosoptics-left","mosoptics-right" exclusive_caps=1' \
  | sudo tee /etc/modprobe.d/v4l2loopback.conf
```

### Troubleshooting

**Camera not showing in Chrome/Meet:**
Check that `exclusive_caps=1` was set when loading the module.
Unload and reload:

```bash
sudo modprobe -r v4l2loopback
sudo modprobe v4l2loopback devices=1 video_nr=10 card_label="mosoptics" exclusive_caps=1
```

**Permission denied on `/dev/video10`:**
Add your user to the `video` group:

```bash
sudo usermod -aG video $USER
# Log out and back in for the group change to take effect
```

**Black screen in the video app:**
Make sure the mosoptics pipeline is running and producing frames
before opening the video app. The loopback device only has frames
when the pipeline is actively writing to it.

---

## macOS Setup

macOS does not have v4l2loopback. Native virtual cameras require a
CoreMediaIO Camera Extension signed by Apple, which involves a
developer program membership and Apple approval.

Instead, use OBS Studio as a bridge. OBS already has an approved
Camera Extension and can consume mosoptics feeds.

### Step 1: Install OBS Studio

Download from [obsproject.com](https://obsproject.com/download) or:

```bash
brew install --cask obs
```

### Step 2: Start your pipeline

```bash
mosoptics-cli run my-pipeline
```

Note the streaming URL shown in the terminal (e.g., `http://localhost:9100`).

### Step 3: Add a Media Source in OBS

1. Open OBS Studio
2. In the **Sources** panel, click **+** and select **Media Source**
3. Name it (e.g., "mosoptics feed")
4. Configure:
   - Uncheck **Local File**
   - **Input**: `http://localhost:9100/stream/my-feed`
   - **Input Format**: leave blank
   - Check **Restart playback when source becomes active**
5. Click **OK**

### Step 4: Start OBS Virtual Camera

1. In the OBS **Controls** panel, click **Start Virtual Camera**
2. The feed now appears as **OBS Virtual Camera** in Google Meet,
   Zoom, and other apps

### Selecting the feed in your video app

Open your video app's camera settings and select **OBS Virtual Camera**.
You should see the mosoptics pipeline output.

---

## Pipeline YAML Configuration

You can also configure loopback output directly in `cli.yaml`:

```yaml
pipelines:
  - name: my-loopback-feed
    desc: "Camera feed with loopback output"
    feed: my-feed
    topic: cli.my.frames
    defaults:
      resolution: "1280x720"
      fps: 30
    steps:
      - def: vision.camera.single
        config:
          camera_id: "my-camera-id"
      - def: vision.loopback.output
        config:
          device: /dev/video10
      - def: vision.frame.feed
      - def: vision.frame.publish
```

For dual pipelines with two loopback devices:

```yaml
    steps:
      - def: vision.camera.dual
        config:
          left:
            camera_id: "left-camera-id"
          right:
            camera_id: "right-camera-id"
      - def: vision.loopback.output.dual
        config:
          left_device: /dev/video10
          right_device: /dev/video11
      - def: vision.dualframe.feed
      - def: vision.dualframe.publish
```

## Step Reference

| Step | Payload | Config | Platform |
|------|---------|--------|----------|
| `vision.loopback.output` | Frame | `device`: path | Linux |
| `vision.loopback.output.dual` | DualFrame | `device` + `side`, or `left_device` + `right_device` | Linux |

Both steps are pass-through: they write frames to the loopback device
and forward the payload unchanged to the next step.
