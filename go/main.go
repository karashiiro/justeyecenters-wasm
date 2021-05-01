package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"syscall/js"
	"time"

	"github.com/karashiiro/justeyecenters"
)

type predictEyeCenterArgs struct {
	Image  string
	Bounds struct {
		Left   int
		Top    int
		Right  int
		Bottom int
	}
}

func getEyeCenter(this js.Value, args []js.Value) interface{} {
	startTime := time.Now()

	eyeCenterArgs := predictEyeCenterArgs{
		Image: args[0].String(),
		Bounds: struct {
			Left   int
			Top    int
			Right  int
			Bottom int
		}{
			Left:   args[1].Int(),
			Top:    args[2].Int(),
			Right:  args[3].Int(),
			Bottom: args[4].Int(),
		},
	}

	// Preprocess the frame
	var imgBuf bytes.Buffer
	imgBuf.WriteString(eyeCenterArgs.Image)
	img, err := png.Decode(&imgBuf)
	if err != nil {
		fmt.Println("Error while decoding PNG image\n\t", err)
		return ""
	}

	croppedImg := img.(interface {
		SubImage(r image.Rectangle) image.Image
	}).SubImage(image.Rect(eyeCenterArgs.Bounds.Left, eyeCenterArgs.Bounds.Top, eyeCenterArgs.Bounds.Right, eyeCenterArgs.Bounds.Bottom))

	// Calculate the eye center location
	fStartTime := time.Now()
	center, err := justeyecenters.GetEyeCenter(croppedImg)
	if err != nil {
		fmt.Println("Error while calculating eye center\n\t", err)
		return ""
	}
	fEndTime := time.Since(fStartTime)

	// Put the output in our interop struct
	ret := &struct {
		X int `json:"x"`
		Y int `json:"y"`
	}{
		X: center.X,
		Y: center.Y,
	}

	retBytes, err := json.Marshal(ret)
	if err != nil {
		fmt.Println("Error while marshalling return value\n\t", err)
		return ""
	}

	fmt.Println("Algorithm time:\n\t", fEndTime.Seconds(), "\n\tFull time:\n\t", time.Since(startTime).Seconds())

	return string(retBytes)
}

func main() {
	c := make(chan struct{})

	js.Global().Set("__justeyecenters", js.ValueOf(map[string]interface{}{
		"getEyeCenter": js.FuncOf(getEyeCenter),
	}))

	<-c
}
