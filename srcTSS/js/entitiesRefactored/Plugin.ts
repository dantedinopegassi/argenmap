class Plugin {
    constructor(name, url, callback) {
      this.name = name;
      this.url = url;
      this.status = "loading";
      this.callback = callback;
    }
  
    getStatus() {
      return this.status;
    }
  
    setStatus(status) {
      switch (status) {
        case "loading":
          this.status = status;
          break;
        case "ready":
          this.status = status;
          break;
        case "fail":
          this.status = status;
          break;
        case "visible":
          this.status = status;
          break;
        default:
          return false;
      }
    }
    triggerLoad() {
      $("body").trigger("pluginLoad", { pluginName: this.name });
    }
  }