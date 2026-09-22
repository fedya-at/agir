import React from "react";
import { Box, Grid, Typography, Avatar, Rating, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Custom styled components
const QuoteCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: "100%",
  position: "relative",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center", // Center content horizontally
  textAlign: "center", // Center text
}));

const QuoteIcon = styled(Typography)(({ theme }) => ({
  fontSize: "64px",
  position: "absolute",
  top: "-20px",
  left: "-10px",
  opacity: 0.1,
  color: theme.palette.primary.main,
  fontFamily: "serif",
}));

const TestimonialAuthor = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center", // Center author details
  marginTop: theme.spacing(2),
}));

const testimonials = [
  {
    id: 1,
    quote:
      "Delectus id dolor sit amet, consectetur adipiscing elit. In anim cupidatat velit tempor minim veniam eius consequat officia et fugiat.",
    author: "Jessica Williams",
    position: "Examination Data Inc.",
    avatar: "/api/placeholder/100/100",
    rating: null,
    variant: "quote-left",
  },
  {
    id: 2,
    quote: "I really appreciated!",
    subtext:
      "Congue maecenas eleifend aliquet id eu velit. Morbi non arcu, risus metus ligula tortor facilisis.",
    author: "Lindsey Edmunds",
    position: "Director H.T.",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    variant: "rating-top",
  },
  {
    id: 3,
    quote:
      "Metus non arcu risus quis varius. Turpis quam augue tristique velit vestibulum!",
    author: "Julie Chen",
    avatar: "/api/placeholder/100/100",
    variant: "featured",
    position: null,
  },
  {
    id: 4,
    quote: "Good Job!",
    subtext:
      "Feugiat facilisi sed ut anim sit amet. Nibh at fringilla phasellus facilitation libero. Nulla lectus.",
    author: null,
    avatar: "/api/placeholder/100/100",
    variant: "simple-right",
  },
  {
    id: 5,
    quote: "I was very impressed!",
    subtext:
      "Etiam maecenas efficitur sit augue. In nulla placerat sollicitudin vulputate. Adipiscing arcu eu fugiat sapien placerat. Velit efficitur into integer maecenas nunc vel.",
    author: null,
    avatar: "/api/placeholder/100/100",
    variant: "simple-center",
  },
  {
    id: 6,
    quote:
      "Lorem ipsum sit amet sit dui, facilisi ipsum fugit velit porttitor primis estudin.",
    author: "Isabella Julie",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    variant: "rating-bottom",
  },
  {
    id: 7,
    quote: "Quis hendrerit varius eu felis praesent velit nunc a est.",
    subtext:
      "Consequat ex amet nulla facilisi velitm. In ex elementum ligula sagittis nunce. Commodo velit hendrerit tempus.",
    author: "Henry Miles",
    position: "Performance Co.",
    avatar: "/api/placeholder/100/100",
    variant: "quote-right",
  },
  {
    id: 8,
    quote:
      "Turpis maecenas hendrerit felis morbi quis nisi amet. Suscipe et etiam sit amet vel. Tempor molestie placerat vestibulum ipsum felis porttitor primis posuere placerat nunc lectus vel amet.",
    author: "David Northwood",
    position: "Studio C.",
    avatar: "/api/placeholder/100/100",
    variant: "simple-right",
  },
];

const Testimonials = () => {
  const renderTestimonial = (testimonial) => (
    <QuoteCard elevation={1}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {testimonial.quote}
      </Typography>
      {testimonial.author && (
        <TestimonialAuthor>
          <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {testimonial.author}
            </Typography>
            {testimonial.position && (
              <Typography variant="caption" color="text.secondary">
                {testimonial.position}
              </Typography>
            )}
          </Box>
        </TestimonialAuthor>
      )}
    </QuoteCard>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#f9f9f9" }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        Testimonials
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center" // Center grid items horizontally
        alignItems="stretch" // Stretch items to match height
      >
        {testimonials.map((testimonial) => (
          <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
            {renderTestimonial(testimonial)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Testimonials;
