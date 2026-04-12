---
title: Installation
description: Get started with mosaigo. Install the framework and create your first pipeline.
---

## Prerequisites

- Go 1.24 or later
- A working Go development environment

## Install

```bash
go get github.com/mosaigoio/mosaigo@latest
```

## Quick start

Create a new Go module and import mosaigo:

```go
package main

import (
    "github.com/mosaigoio/mosaigo/engine"
    "github.com/mosaigoio/mosaigo/mos"
)

func main() {
    eng := engine.NewBuilder("my-pipeline").
        AddByName("capture.session").
        Build()

    if issues := eng.Validate(); len(issues) > 0 {
        mos.LogIssues(issues)
        return
    }

    eng.Run()
}
```

## Next steps

- Browse the [step catalog](/steps/) for available processing steps
