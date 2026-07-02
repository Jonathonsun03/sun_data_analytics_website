build_ann_ena_sample <- function(data_path) {
  sample_data <- read.csv(data_path, stringsAsFactors = FALSE)
  code_cols <- grep("^is_", names(sample_data), value = TRUE)

  ena_accum <- rENA::ena.accumulate.data(
    units = sample_data[c("date", "article_id")],
    conversation = sample_data["date"],
    codes = sample_data[code_cols],
    window.size.back = "inf"
  )

  ena_set <- rENA::ena.make.set(ena_accum)
  ena_mean_network <- colMeans(as.matrix(ena_set$line.weights), na.rm = TRUE)

  date_values <- unique(ena_set$points$date)
  ena_date_points <- lapply(date_values, function(date_value) {
    date_points <- ena_set$points[ena_set$points$date == date_value, , drop = FALSE]
    colMeans(as.matrix(date_points), na.rm = TRUE)
  })
  names(ena_date_points) <- date_values

  list(
    data = sample_data,
    ENA_set = ena_set,
    ENA_mean_network = ena_mean_network,
    ENA_dates_points = ena_date_points
  )
}

plotly_sized <- function(p, height = 725) {
  p$width <- "100%"
  p$height <- height

  plotly::layout(
    p,
    autosize = TRUE,
    height = height
  )
}

pad_range <- function(values, padding = 0.12) {
  value_range <- range(values, na.rm = TRUE)
  range_width <- diff(value_range)

  if (range_width == 0) {
    range_width <- max(abs(value_range), 1)
  }

  c(
    value_range[1] - range_width * padding,
    value_range[2] + range_width * padding
  )
}

fit_network_viewport <- function(network_plot, network_nodes, x_padding = 0.11, y_padding = 0.10) {
  initial_x_range <- pad_range(network_nodes$SVD1, padding = x_padding)
  initial_y_range <- pad_range(network_nodes$SVD2, padding = y_padding)

  network_plot$x$layout$xaxis$range <- initial_x_range
  network_plot$x$layout$xaxis$autorange <- FALSE
  network_plot$x$layout$yaxis$range <- initial_y_range
  network_plot$x$layout$yaxis$autorange <- FALSE
  network_plot$x$layout$yaxis$scaleanchor <- NULL
  network_plot$x$layout$yaxis$scaleratio <- NULL

  network_plot
}

add_ena_point_groups <- function(
  base_plot,
  point_list,
  colors = NULL,
  shape = "circle",
  show_legend = TRUE,
  label.offset = "top left",
  label.font.size = 10,
  label.font.color = "#1f2933",
  label.font.family = "Arial"
) {
  stopifnot(is.list(point_list))

  group_names <- names(point_list)
  group_names <- ifelse(is.na(group_names) | group_names == "", "UNKNOWN", group_names)
  group_names <- make.unique(group_names)
  names(point_list) <- group_names

  if (is.null(colors) || is.null(names(colors)) || any(!group_names %in% names(colors))) {
    colors <- setNames(grDevices::rainbow(length(group_names)), group_names)
  }

  plot <- base_plot

  for (group_name in group_names) {
    pts <- point_list[[group_name]]

    if (is.atomic(pts) && is.null(dim(pts))) {
      if (length(pts) < 2) {
        stop(sprintf("Point group '%s' has fewer than two dimensions.", group_name))
      }
      pts <- matrix(pts[1:2], ncol = 2)
    } else {
      pts <- as.data.frame(pts)
      if (ncol(pts) < 2) {
        stop(sprintf("Point group '%s' has fewer than two dimensions.", group_name))
      }
      pts <- as.matrix(pts[, 1:2, drop = FALSE])
    }

    plot <- rENA::ena.plot.points(
      plot,
      points = pts,
      labels = rep(group_name, nrow(pts)),
      label.offset = label.offset,
      label.font.size = label.font.size,
      label.font.color = label.font.color,
      label.font.family = label.font.family,
      colors = colors[[group_name]],
      shape = shape,
      legend.name = if (show_legend) group_name else NULL
    )
  }

  plot
}

hide_date_point_traces <- function(plotly_plot, date_names) {
  for (trace_index in seq_along(plotly_plot$x$data)) {
    trace <- plotly_plot$x$data[[trace_index]]
    if (!is.null(trace$name) && trace$name %in% date_names && grepl("markers", trace$mode %||% "")) {
      plotly_plot$x$data[[trace_index]]$visible <- "legendonly"
    }
  }

  plotly_plot
}

`%||%` <- function(x, y) {
  if (is.null(x)) y else x
}

plot_ann_ena_sample <- function(data_path, show_date_points = FALSE, height = 725) {
  ena_sample <- build_ann_ena_sample(data_path)

  base_plot <- rENA::ena.plot(ena_sample$ENA_set, title = "Sample Anime News Network Trends")
  base_plot <- rENA::ena.plot.network(
    base_plot,
    network = ena_sample$ENA_mean_network,
    colors = "red"
  )

  date_plot <- add_ena_point_groups(base_plot, ena_sample$ENA_dates_points)
  plotly_plot <- plotly_sized(date_plot$plot, height = height)
  plotly_plot <- plotly::plotly_build(plotly_plot)

  if (!isTRUE(show_date_points)) {
    plotly_plot <- hide_date_point_traces(plotly_plot, names(ena_sample$ENA_dates_points))
  }

  fit_network_viewport(
    plotly_plot,
    network_nodes = ena_sample$ENA_set$rotation$nodes
  )
}
