import React from "react";
import { Box, Grid, Typography, Avatar, Paper } from "@mui/material";
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

const userTestimonials = [
  {
    id: 1,
    avatar:
      "https://ui-avatars.com/api/?name=Saif+Eddin&background=4CAF50&color=fff&size=100",
    name: "Saif Eddin",
    occupation: "طالب في كلية الهندسة",
    testimonial:
      "والله محل ممتاز! اللابتوب متاعي كان طايح وما يشدش، جيت لعندهم وفي نهار واحد صلحوهولي. الخدمة زينة والسعر معقول، ننصح بيهم كل الطلبة.",
  },
  {
    id: 2,
    avatar:
      "https://ui-avatars.com/api/?name=Yasmine+Khaled&background=2196F3&color=fff&size=100",
    name: "Yasmine Khaled",
    occupation: "موظفة في بنك",
    testimonial:
      "أحسن محل صيانة في تونس! اللابتوب متاعي كان فيه مشكل في الشاشة وحلوهولي بسرعة. الفني شرحلي المشكلة مليح وعطاني ضمانة على الإصلاح. خدمة محترمة برشا.",
  },
  {
    id: 3,
    avatar:
      "https://ui-avatars.com/api/?name=Omar+Al+Farsi&background=FF9800&color=fff&size=100",
    name: "Omar Al Farsi",
    occupation: "مطور مواقع ويب",
    testimonial:
      "نخدم على اللابتوب متاعي كل نهار، وكي خرب جيت لعندهم بسرعة. صلحوه في وقت قياسي وخدامتو رجعت أحسن من قبل. عندهم خبرة كبيرة في الصيانة والناس مليحين برشا.",
  },
  {
    id: 4,
    avatar:
      "https://ui-avatars.com/api/?name=Lina+Mansour&background=E91E63&color=fff&size=100",
    name: "Lina Mansour",
    occupation: "طالبة في كلية الطب",
    testimonial:
      "اللابتوب متاعي كان بطيء برشا ونراجع عليه للامتحانات. جيت لعندهم وحلوا المشكلة في ساعات قليلة. تو يخدم كيف الجديد! الأسعار مناسبة للطلبة والخدمة فوق الممتاز.",
  },
  {
    id: 5,
    avatar:
      "https://ui-avatars.com/api/?name=Ahmed+Nasser&background=9C27B0&color=fff&size=100",
    name: "Ahmed Nasser",
    occupation: "محاسب في شركة خاصة",
    testimonial:
      "عندي مشكل في الكيبورد واللابتوب ما عادش يشحن. خفت انو مات نهائياً، أما هوما اكتشفوا المشكلة وحلوها بسرعة. خدمة احترافية وضمانة على كل حاجة يصلحوها.",
  },
  {
    id: 6,
    avatar:
      "https://ui-avatars.com/api/?name=Sara+Al+Amiri&background=607D8B&color=fff&size=100",
    name: "Sara Al Amiri",
    occupation: "مصممة جرافيك",
    testimonial:
      "نخدم على الفوتوشوب والإليستريتر كل نهار، واللابتوب متاعي بدا يسخن برشا ويعمل restart وحدو. جيت لعندهم ونظفوه مليح وبدلولي المروحة. تو يخدم كالعادة، ما عندي حتى مشكل.",
  },
];

const Testimonials = () => {
  const renderTestimonial = (testimonial) => (
    <QuoteCard elevation={1}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {testimonial.testimonial}
      </Typography>
      {testimonial.name && (
        <TestimonialAuthor>
          <Avatar src={testimonial.avatar} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {testimonial.name}
            </Typography>
            {testimonial.occupation && (
              <Typography variant="caption" color="text.secondary">
                {testimonial.occupation}
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
        Avis de nos clients
      </Typography>
      <Grid
        container
        spacing={3}
        justifyContent="center" // Center grid items horizontally
        alignItems="stretch" // Stretch items to match height
      >
        {userTestimonials.map((testimonial) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={testimonial.id}>
            {renderTestimonial(testimonial)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Testimonials;
