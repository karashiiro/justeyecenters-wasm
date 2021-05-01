package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"syscall/js"

	"github.com/karashiiro/justeyecenters"
)

type predictEyeCenterArgs struct {
	Image  string `json:"image"`
	Bounds struct {
		Left   int `json:"left"`
		Top    int `json:"top"`
		Right  int `json:"right"`
		Bottom int `json:"bottom"`
	} `json:"bounds"`
}

func getEyeCenter(value js.Value, args []js.Value) interface{} {
	eyeCenterArgs := predictEyeCenterArgs{}
	err := json.Unmarshal([]byte(value.String()), &eyeCenterArgs)
	if err != nil {
		fmt.Println("Error while unmarshalling arguments\n\t", err, "\n\tArguments: ", value.String())
		return ""
	}

	// Preprocess the frame
	rawImage, err := base64.StdEncoding.DecodeString(eyeCenterArgs.Image[len("data:image/png;base64,"):])
	if err != nil {
		fmt.Println("Error while decoding base64 image\n\t", err)
		return ""
	}

	var imgBuf bytes.Buffer
	imgBuf.Write(rawImage)
	img, err := png.Decode(&imgBuf)
	if err != nil {
		fmt.Println("Error while decoding PNG image\n\t", err)
		return ""
	}

	croppedImg := img.(interface {
		SubImage(r image.Rectangle) image.Image
	}).SubImage(image.Rect(eyeCenterArgs.Bounds.Left, eyeCenterArgs.Bounds.Top, eyeCenterArgs.Bounds.Right, eyeCenterArgs.Bounds.Bottom))

	// Calculate the eye center location
	center, err := justeyecenters.GetEyeCenter(croppedImg)
	if err != nil {
		fmt.Println("Error while calculating eye center\n\t", err)
		return ""
	}

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

	return string(retBytes)
}

func main() {
	c := make(chan struct{})

	js.Global().Set("__justeyecenters", js.ValueOf(map[string]interface{}{
		"getEyeCenter": js.FuncOf(getEyeCenter),
	}))

	<-c
}
